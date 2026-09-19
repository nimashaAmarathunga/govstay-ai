import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: "global" }
    });

    if (!config) {
      // Fallback if not seeded yet
      return NextResponse.json({
        bankName: "ABC Bank",
        accountName: "GovSewana Official Bank Account",
        accountNumber: "123456"
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching system config:", error);
    // Fallback on error
    return NextResponse.json({
      bankName: "ABC Bank",
      accountName: "GovSewana Official Bank Account",
      accountNumber: "123456"
    });
  }
}
