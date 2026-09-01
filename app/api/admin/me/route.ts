import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const adminPayload = await getAuthenticatedAdmin();

  if (!adminPayload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: adminPayload.userId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      placeOfWork: true,
      position: true,
      emailAddress: true,
      mobileNumber: true,
    },
  });

  if (!user || (user.role !== "DEPT_ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
