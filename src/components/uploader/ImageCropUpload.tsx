"use client";

import Cropper from "react-easy-crop";
import { useCallback, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import UIButton from "@/components/common/UIButton";
import { showAvatarUpdated, showBucketCreated, showBucketMissing, showError, showUploadFailed } from "@/lib/toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Area = { x: number; y: number; width: number; height: number };

export type ImageCropUploadProps = {
  userId: string;
  initialUrl?: string | null;
  onUploaded?: (url: string) => void;
  folder?: string; // default: avatars
  aspect?: number; // default: 1
};

export default function ImageCropUpload({ userId, initialUrl, onUploaded, folder = "avatars", aspect = 1 }: ImageCropUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = () => inputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_a: Area, cropped: Area) => setCroppedAreaPixels(cropped), []);

  const canvasFromImage = async (image: HTMLImageElement, cropPx: Area) => {
    const canvas = document.createElement("canvas");
    canvas.width = cropPx.width;
    canvas.height = cropPx.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");
    ctx.drawImage(
      image,
      cropPx.x,
      cropPx.y,
      cropPx.width,
      cropPx.height,
      0,
      0,
      cropPx.width,
      cropPx.height
    );
    return canvas;
  };

  const createCroppedImageBlob = async (): Promise<Blob> => {
    if (!imageSrc || !croppedAreaPixels) throw new Error("No image or crop area");
    const image = new Image();
    image.src = imageSrc;
    await new Promise((res) => (image.onload = res));
    const canvas = await canvasFromImage(image, croppedAreaPixels);
    // Convert canvas to file then compress with browser-image-compression
    const rawBlob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))), "image/jpeg", 0.95)
    );
    const rawFile = new File([rawBlob], "crop.jpg", { type: "image/jpeg" });
    const compressed = await imageCompression(rawFile, {
      maxWidthOrHeight: 512,
      maxSizeMB: 1,
      initialQuality: 0.85,
      useWebWorker: true,
    });
    return compressed;
  };

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const uploadOnce = async (blob: Blob) => {
    const fileName = `${Date.now()}.jpg`;
    const path = `${userId}/${fileName}`;
    const { error } = await supabase.storage.from(folder).upload(path, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(folder).getPublicUrl(path);
    onUploaded?.(data.publicUrl);
  };

  const handleUpload = async () => {
    try {
      setBusy(true);
      const blob = await createCroppedImageBlob();
      await uploadOnce(blob);
      setImageSrc(null);
      showAvatarUpdated();
    } catch (e) {
      console.error(e);
      const err = e as unknown as { message?: string };
      if (err?.message && err.message.includes("Bucket not found")) {
        showBucketMissing();
        try {
          const res = await fetch("/api/dev/ensure-avatars-bucket", { method: "POST" });
          if (!res.ok) throw new Error("bucket create failed");
          showBucketCreated();
          // retry once after creating bucket
          const blob = await createCroppedImageBlob();
          await uploadOnce(blob);
          setImageSrc(null);
          showAvatarUpdated();
          return;
        } catch {
          showError();
        }
      } else {
        showUploadFailed();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <div className="size-16 rounded-full overflow-hidden bg-muted">
          {initialUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={initialUrl} alt="avatar" className="size-full object-cover" />
          ) : (
            <div className="size-full grid place-items-center text-xs text-muted-foreground">No Image</div>
          )}
        </div>
        <UIButton type="button" onClick={handleFilePick}>Change</UIButton>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {imageSrc && (
        <div className="rounded-md border p-3 grid gap-3 max-w-sm">
          <div className="relative w-full aspect-square bg-muted overflow-hidden rounded-md">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
            <UIButton type="button" variant="secondary" onClick={() => setImageSrc(null)} disabled={busy}>Cancel</UIButton>
            <UIButton type="button" onClick={handleUpload} disabled={busy}>{busy ? "Uploading..." : "Save"}</UIButton>
          </div>
        </div>
      )}
    </div>
  );
}


