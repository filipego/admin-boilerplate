import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

/**
 * Generic file upload endpoint to Cloudflare R2.
 * Env required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 * Expects multipart/form-data with:
 * - file: Blob (required)
 * - folder: string (optional, default "uploads")
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = (form.get("folder") as string) || "uploads";

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicBaseUrl = process.env.R2_PUBLIC_URL;

    const missing: string[] = [];
    if (!accountId) missing.push("R2_ACCOUNT_ID");
    if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
    if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
    if (!bucket) missing.push("R2_BUCKET_NAME");
    if (!publicBaseUrl) missing.push("R2_PUBLIC_URL");
    if (missing.length) {
      return NextResponse.json({ error: `Missing env: ${missing.join(", ")}` }, { status: 500 });
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    // Sanitize folder and build key
    const safeFolder = folder.replace(/^\/+|\/+$/g, "").replace(/\.\.|\s+/g, "");
    const originalName = (file as File).name || `file-${Date.now()}`;
    const time = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const key = `${safeFolder}/${time}-${rand}-${originalName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBytes,
        ContentType: (file as File).type || "application/octet-stream",
      })
    );

    const url = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
    return NextResponse.json({ url, key });
  } catch (err) {
    const e = err as Error;
    console.error("/api/upload-file unexpected:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}


