import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Fields to expose — never return the password
const userSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  empId: true,
  status: true,
  placeOfWork: true,
  position: true,
  empIdPhoto: true,
  nicNumber: true,
  mobileNumber: true,
  emailAddress: true,
  residentialAddress: true,
  preferredDistrict: true,
  createdAt: true,
} as const;

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "asc" },
    });
    return Response.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return Response.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      username,
      password,
      role,
      empId,
      status,
      placeOfWork,
      position,
      empIdPhoto,
      nicNumber,
      mobileNumber,
      emailAddress,
      residentialAddress,
      preferredDistrict,
    } = body;

    if (!name) {
      return Response.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    // Auto-generate username if not provided (e.g. from email/empId/name + random suffix)
    const finalUsername =
      username ||
      (emailAddress ? emailAddress.split('@')[0] : null) ||
      (empId ? empId.toLowerCase().replace(/[^a-z0-9]/g, '') : null) ||
      `user_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;

    const finalPassword = password || "userPass123";

    const user = await prisma.user.create({
      data: {
        name,
        username: finalUsername,
        password: finalPassword,
        role: role ?? "GOV_EMPLOYEE",
        empId: empId || undefined,
        status: status ?? "WORKING",
        placeOfWork: placeOfWork || undefined,
        position: position || undefined,
        empIdPhoto: empIdPhoto || undefined,
        nicNumber: nicNumber || undefined,
        mobileNumber: mobileNumber || undefined,
        emailAddress: emailAddress || undefined,
        residentialAddress: residentialAddress || undefined,
        preferredDistrict: preferredDistrict || undefined,
      },
      select: userSelect,
    });

    return Response.json(user, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/users error:", error);
    // Unique-constraint violation (username / empId already exists)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return Response.json(
        { error: "Username or Employee ID already exists in system." },
        { status: 409 }
      );
    }
    return Response.json({ error: "Failed to create user." }, { status: 500 });
  }
}
