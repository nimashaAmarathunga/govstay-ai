import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { jwtVerify } from "jose";

const handleI18nRouting = createMiddleware(routing);

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "govstay_super_secret_jwt_key_2026_production_grade";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const ADMIN_COOKIE_NAME = "govstay_admin_token";
const USER_COOKIE_NAME = "govstay_user_token";

async function isValidToken(
  token: string | undefined,
  requiredRole?: "admin" | "user"
): Promise<boolean> {
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

  // Skip API routes and static assets from i18n and auth middleware
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // static files like favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  // 1. First run the i18n middleware
  const response = handleI18nRouting(request);

  // Extract current locale from pathname or default
  const segments = pathname.split("/").filter(Boolean);
  const detectedLocale =
    segments[0] && routing.locales.includes(segments[0] as "en" | "si")
      ? (segments[0] as "en" | "si")
      : routing.defaultLocale;

  // Calculate locale-agnostic pathname (e.g., /en/admin -> /admin)
  const normalizedPathname =
    segments[0] && routing.locales.includes(segments[0] as "en" | "si")
      ? "/" + segments.slice(1).join("/")
      : pathname;

  // ---------------------------------------------------------------------------
  // 2. Admin Route Guard (/admin and /admin/*)
  // ---------------------------------------------------------------------------
  if (normalizedPathname.startsWith("/admin")) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isLoginPage = normalizedPathname === "/admin/login";
    const hasValidAdminToken = await isValidToken(adminToken, "admin");

    // If admin has a valid token and visits /admin/login, redirect to dashboard
    if (isLoginPage && hasValidAdminToken) {
      return NextResponse.redirect(new URL(`/${detectedLocale}/admin`, request.url));
    }

    // Allow access to /admin/login without token
    if (isLoginPage) {
      return response;
    }

    // For all other /admin routes, require a valid admin JWT
    if (!hasValidAdminToken) {
      const loginUrl = new URL(`/${detectedLocale}/admin/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      if (adminToken) {
        redirectResponse.cookies.delete(ADMIN_COOKIE_NAME);
      }
      return redirectResponse;
    }

    return response;
  }

  // ---------------------------------------------------------------------------
  // 3. User Login Page (/login)
  // ---------------------------------------------------------------------------
  if (normalizedPathname === "/login") {
    const userToken = request.cookies.get(USER_COOKIE_NAME)?.value;
    const hasValidUserToken = await isValidToken(userToken, "user");

    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (hasValidUserToken && redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }

    return response;
  }

  return response;
}

export const config = {
  // Match all request paths except api, _next/static, _next/image, favicon.ico
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
