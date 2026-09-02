import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "govstay_super_secret_jwt_key_2026_production_grade";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const ADMIN_COOKIE_NAME = "govstay_admin_token";
const USER_COOKIE_NAME = "govstay_user_token";

async function isValidToken(token: string | undefined, requiredRole?: "admin" | "user"): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (requiredRole === "admin") {
      return payload.role === "DEPT_ADMIN" || payload.role === "SUPER_ADMIN";
    }
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // 1. Admin Route Guard (/admin and /admin/*)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isLoginPage = pathname === "/admin/login";
    const hasValidAdminToken = await isValidToken(adminToken, "admin");

    // If admin has a valid token and visits /admin/login, redirect to dashboard
    if (isLoginPage && hasValidAdminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Allow access to /admin/login without token
    if (isLoginPage) {
      return NextResponse.next();
    }

    // For all other /admin routes, require a valid admin JWT
    if (!hasValidAdminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clean up invalid cookie if present
      if (adminToken) {
        response.cookies.delete(ADMIN_COOKIE_NAME);
      }
      return response;
    }

    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 2. User Protected Routes (/dashboard, /bookings, /profile)
  // ---------------------------------------------------------------------------
  if (["/dashboard", "/bookings", "/profile"].includes(pathname)) {
    const userToken = request.cookies.get(USER_COOKIE_NAME)?.value;
    const hasValidUserToken = await isValidToken(userToken, "user");

    if (!hasValidUserToken) {
      const loginUrl = new URL("/sign-in", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 3. Auth Pages (/sign-in, /id-upload)
  // ---------------------------------------------------------------------------
  if (["/sign-in", "/id-upload"].includes(pathname)) {
    const userToken = request.cookies.get(USER_COOKIE_NAME)?.value;
    const hasValidUserToken = await isValidToken(userToken, "user");

    // If user is already authenticated and visits /sign-in or /register
    if (hasValidUserToken) {
      const redirectParam = request.nextUrl.searchParams.get("redirect");
      if (redirectParam) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/sign-in", "/id-upload", "/dashboard", "/bookings", "/profile"],
};
