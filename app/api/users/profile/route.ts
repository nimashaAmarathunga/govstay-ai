import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Build update data — support both legacy mapped names and direct Prisma field names
    const updateData: Record<string, unknown> = {};

    // Name
    if (body.fullName !== undefined) updateData.name = body.fullName;
    else if (body.name !== undefined) updateData.name = body.name;

    // NIC
    if (body.nic !== undefined) updateData.nicNumber = body.nic;
    else if (body.nicNumber !== undefined) updateData.nicNumber = body.nicNumber;

    // Employee ID
    if (body.memberId !== undefined) updateData.empId = body.memberId;
    else if (body.empId !== undefined) updateData.empId = body.empId;

    // Mobile
    if (body.phone !== undefined) updateData.mobileNumber = body.phone;
    else if (body.mobileNumber !== undefined) updateData.mobileNumber = body.mobileNumber;

    // Email
    if (body.email !== undefined) updateData.emailAddress = body.email;
    else if (body.emailAddress !== undefined) updateData.emailAddress = body.emailAddress;

    // Department / Place of Work
    if (body.department !== undefined) updateData.placeOfWork = body.department;
    else if (body.placeOfWork !== undefined) updateData.placeOfWork = body.placeOfWork;

    // Position / Designation
    if (body.designation !== undefined) updateData.position = body.designation;
    else if (body.position !== undefined) updateData.position = body.position;

    // District
    if (body.district !== undefined) updateData.preferredDistrict = body.district;
    else if (body.preferredDistrict !== undefined) updateData.preferredDistrict = body.preferredDistrict;

    // Address
    if (body.address !== undefined) updateData.residentialAddress = body.address;
    else if (body.residentialAddress !== undefined) updateData.residentialAddress = body.residentialAddress;

    // Employee ID Photo
    if (body.empIdPhoto !== undefined) updateData.empIdPhoto = body.empIdPhoto;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
