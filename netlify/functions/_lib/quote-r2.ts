import { S3Client } from "@aws-sdk/client-s3";
export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Configure ${name} no servidor.`);
  return value;
}
export function privateBucket() {
  const name = requiredEnv("R2_QUOTES_BUCKET_NAME");
  if (name === process.env.R2_BUCKET_NAME)
    throw new Error(
      "Use um bucket privado separado para as artes dos clientes.",
    );
  return name;
}
export function quoteR2() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}
