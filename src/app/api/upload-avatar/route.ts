import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

// Upload avatar to Cloudflare R2 using explicit env var names provided by the user
// Env required:
// R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
// Expects multipart/form-data with: file (Blob), userId (string)
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const userId = form.get("userId");
    const previousUrl = form.get("previousUrl");

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    const userIdStr = typeof userId === "string" ? userId : "unknown";

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

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);
    const key = `avatars/${userIdStr}/${Date.now()}.jpg`;

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: fileBytes,
          ContentType: "image/jpeg",
        })
      );
    } catch (e) {
      const err = e as Error & { Code?: string; name?: string };
      console.error("R2 upload error:", err?.message || err);
      return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
    }

    // Construct public URL served via R2 public domain
    const url = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;

    // Best-effort delete previous object if it belongs to our R2 public base URL
    try {
      const prevUrlStr = typeof previousUrl === "string" ? previousUrl : "";
      const base = publicBaseUrl.replace(/\/$/, "");
      if (prevUrlStr.startsWith(base + "/")) {
        const prevKey = prevUrlStr.slice(base.length + 1);
        if (prevKey && prevKey !== key) {
          await s3.send(
            new DeleteObjectCommand({ Bucket: bucket, Key: prevKey })
          );
        }
      }
    } catch (e) {
      // ignore delete errors, not critical
      console.warn("R2 delete old avatar failed:", (e as Error)?.message || e);
    }

    return NextResponse.json({ url });
  } catch (err) {
    const e = err as Error;
    console.error("/api/upload-avatar unexpected:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}


