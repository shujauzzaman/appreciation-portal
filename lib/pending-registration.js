import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const secret = process.env.OTP_COOKIE_SECRET;

  if (!secret) {
    throw new Error("OTP_COOKIE_SECRET is not configured.");
  }

  return crypto
    .createHash("sha256")
    .update(secret)
    .digest();
}

export function encryptRegistration(data) {
  const key = getKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptRegistration(value) {
  const key = getKey();

  const [ivString, authTagString, encryptedString] =
    value.split(".");

  if (!ivString || !authTagString || !encryptedString) {
    throw new Error("Invalid registration token.");
  }

  const iv = Buffer.from(ivString, "base64url");
  const authTag = Buffer.from(authTagString, "base64url");
  const encrypted = Buffer.from(encryptedString, "base64url");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8"));
}