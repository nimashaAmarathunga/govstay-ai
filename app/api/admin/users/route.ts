import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getAuthenticatedAdmin } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Only return DEPT_ADMINs for the super admin view
    const admins = await prisma.user.findMany({
      where: {
        role: Role.DEPT_ADMIN,
      },
      select: {
        id: true,
        name: true,
        username: true,
        placeOfWork: true,
        emailAddress: true,
        mobileNumber: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ success: true, data: admins });
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, password, placeOfWork, emailAddress, mobileNumber } = body;

    if (!name || !username || !password || !placeOfWork) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Username already taken" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        placeOfWork,
        emailAddress: emailAddress || null,
        mobileNumber: mobileNumber || null,
        role: Role.DEPT_ADMIN,
        // Mock default fields required by schema
        nicNumber: `ADMIN-${Math.floor(Math.random() * 100000)}`,
        preferredDistrict: "Colombo",
        residentialAddress: "N/A"
      },
      select: {
        id: true,
        name: true,
        username: true,
        placeOfWork: true,
        emailAddress: true,
        mobileNumber: true,
      }
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ success: false, error: "Failed to create admin: " + error.message }, { status: 500 });
  }
}
