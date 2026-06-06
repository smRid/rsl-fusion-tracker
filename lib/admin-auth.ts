import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "rsl-admin-session";

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return false;
  }

  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createAdminSessionToken(): string {
  return signAdminValue(process.env.ADMIN_USERNAME ?? "");
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token || !isAdminAuthConfigured()) {
    return false;
  }

  return safeEqual(token, createAdminSessionToken());
}

function signAdminValue(value: string): string {
  return createHmac("sha256", getAdminSecret()).update(value).digest("hex");
}

function getAdminSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "admin-session";
}

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}
