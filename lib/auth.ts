import crypto from "crypto";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "govstay_super_secret_admin_key_2026";
export const ADMIN_COOKIE_NAME = "govstay_admin_token";

export interface AdminJwtPayload {
  userId: string;
  username: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Verifies a plain text password against a stored hash or plaintext string.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  // If stored as salt:hash (for future hashed passwords)
  if (stored.includes(":") && stored.length > 100) {
    const [salt, originalHash] = stored.split(":");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return hash === originalHash;
  }
  // Direct equality for seeded plain text passwords
  return password === stored;
}

/**
 * Creates a signed token string (HMAC SHA-256 base64url encoded payload).
 */
export function signAdminToken(user: { id: string; username: string; role: string; name: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload: AdminJwtPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a signed admin token.
 */
export function verifyAdminToken(token: string): AdminJwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload: AdminJwtPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies admin token from Next.js server cookie store.
 */
export async function getAuthenticatedAdmin(): Promise<AdminJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}
