import { NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear HTTP-only User session cookie
  response.cookies.delete(USER_COOKIE_NAME);

  return response;
}
