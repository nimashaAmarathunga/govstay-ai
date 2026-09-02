import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import argon2 from "argon2";

// Secret key for JWT signing - sourced from environment variable with fallback
const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "govstay_super_secret_jwt_key_2026_production_grade";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export const USER_COOKIE_NAME = "govstay_user_token";
export const ADMIN_COOKIE_NAME = "govstay_admin_token";

export interface UserJwtPayload {
  userId: string;
  username: string;
  role: string;
  name: string;
  email?: string | null;
  empId?: string | null;
  [key: string]: unknown;
}

export interface AdminJwtPayload {
  userId: string;
  username: string;
  role: string;
  name: string;
  [key: string]: unknown;
}

// ─── Argon2 Password Hashing & Security ──────────────────────────────────────

/**
 * Recommended OWASP Argon2id configuration:
 * - Type: Argon2id (resistant to GPU cracking and side-channel timing attacks)
 * - Memory cost: 64 MB (65536 KB)
 * - Time cost: 3 iterations
 * - Parallelism: 4 threads
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 parallel threads
} as const;

/**
 * Hashes a plain-text password using Argon2id with cryptographically secure random salt.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string.");
  }
  return await argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Determines whether a stored password string needs to be migrated to Argon2id.
 */
export function needsRehash(stored: string): boolean {
  if (!stored) return true;
  return !stored.startsWith("$argon2");
}

/**
 * Validates password strength policy.
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Password is required." };
  }
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasLetter || !hasDigitOrSpecial) {
    return {
      isValid: false,
      message: "Password must contain at least one letter and one number or special character.",
    };
  }

  return { isValid: true };
}

/**
 * Securely verifies a plain-text password against a stored Argon2 hash (or legacy format).
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!password || !stored) return false;

  // 1. Primary path: Verify modern Argon2id hash
  if (stored.startsWith("$argon2")) {
    try {
      return await argon2.verify(stored, password);
    } catch {
      return false;
    }
  }

  // 2. Backward compatibility path: Legacy PBKDF2 (salt:hash format)
  if (stored.includes(":") && stored.length > 100) {
    try {
      const [salt, originalHash] = stored.split(":");
      const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
    } catch {
      return false;
    }
  }

  // 3. Backward compatibility path: Legacy plain text (for lazy migration)
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(stored);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return password === stored;
  }
}

// ─── JWT Authentication Utilities (jose) ────────────────────────────────────

/**
 * Signs a JWT for a standard user (7 days expiry).
 */
export async function signUserToken(user: {
  id: string;
  username: string;
  role: string;
  name: string;
  emailAddress?: string | null;
  empId?: string | null;
}): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.emailAddress || null,
    empId: user.empId || null,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies a user JWT and returns the decoded payload.
 */
export async function verifyUserToken(token: string): Promise<UserJwtPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the user token from Next.js server cookie store or Authorization header.
 */
export async function getAuthenticatedUser(request?: Request): Promise<UserJwtPayload | null> {
  try {
    // 1. Check Authorization header if request is provided
    if (request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7).trim();
        const payload = await verifyUserToken(token);
        if (payload) return payload;
      }
    }

    // 2. Check Next.js server cookies
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyUserToken(token);
  } catch {
    return null;
  }
}

/**
 * Signs a JWT for an administrator (24 hours expiry).
 */
export async function signAdminToken(user: {
  id: string;
  username: string;
  role: string;
  name: string;
}): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies an admin JWT and returns the decoded payload.
 */
export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Ensure the token has administrative role
    if (payload.role !== "DEPT_ADMIN" && payload.role !== "SUPER_ADMIN") {
      return null;
    }
    return payload as unknown as AdminJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the admin token from Next.js server cookie store or Authorization header.
 */
export async function getAuthenticatedAdmin(request?: Request): Promise<AdminJwtPayload | null> {
  try {
    // 1. Check Authorization header if request is provided
    if (request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7).trim();
        const payload = await verifyAdminToken(token);
        if (payload) return payload;
      }
    }

    // 2. Check Next.js server cookies
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}
