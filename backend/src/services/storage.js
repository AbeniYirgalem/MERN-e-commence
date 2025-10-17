const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const path = require("path");

// Storage service: uses AWS S3 SDK v3. Supports MinIO via endpoint override in env.
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
  forcePathStyle: !!process.env.S3_FORCE_PATH_STYLE,
});

const uploadStream = async ({ key, body, contentType, bucket }) => {
  const target = bucket || process.env.S3_BUCKET;
  if (!target) throw new Error("S3 bucket not configured");

  const upload = new Upload({
    client: s3Client,
    params: { Bucket: target, Key: key, Body: body, ContentType: contentType },
  });

  const res = await upload.done();
  // construct URL - for MinIO endpoints this may differ; provide stored key and bucket
  const url = process.env.S3_URL_PREFIX
    ? `${process.env.S3_URL_PREFIX}/${target}/${key}`
    : `https://${target}.s3.amazonaws.com/${key}`;
  return { key, url, res };
};

const buildKey = (prefix, originalName) => {
  const ext = path.extname(originalName || "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  return prefix ? `${prefix}/${name}` : name;
};

module.exports = { uploadStream, buildKey };
