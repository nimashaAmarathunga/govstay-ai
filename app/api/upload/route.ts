import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'govstay_super_secret_jwt_key_2026_production_grade'
);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('govstay_user_token')?.value;
    
    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bookingId = formData.get('bookingId') as string | null;
    const fallbackUserId = formData.get('userId') as string | null;

    let userId: string | null = null;
    
    if (token) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        userId = verified.payload.userId as string;
      } catch (err) {
        console.warn('Invalid token, falling back to client userId');
      }
    }
    
    if (!userId) {
      userId = fallbackUserId;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid user context' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // If no bookingId is provided (e.g. for ID uploads), skip booking ownership check.
    const folder = (formData.get('folder') as string) || 'ids';
    const isSlip = folder === 'slips' || formData.has('bookingId');
    
    if (isSlip) {
      if (!bookingId) {
        return NextResponse.json({ error: 'Booking ID is required for payment slips' }, { status: 400 });
      }

      // 3. Verify Booking Ownership
      const booking = await prisma.booking.findUnique({
        where: { bookingId },
        select: { id: true, userId: true } // booking.id is the internal UUID
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      if (booking.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this booking' }, { status: 403 });
      }
    }

    // 4. Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WEBP images and PDF documents are allowed.' },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Upload to Supabase Storage
    const safeFolder = isSlip ? 'payment-slips' : 'ids';
    
    const rawExt = file.name.split('.').pop() || 'bin';
    const sanitizedExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const uniqueFileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${sanitizedExt}`;
    
    // Path structure: payment-slips/{userId}/{bookingId}/{fileName}
    const storagePath = isSlip 
      ? `${userId}/${bookingId}/${uniqueFileName}`
      : `ids/${userId}/${uniqueFileName}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from(safeFolder)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (storageError) {
      console.error('Supabase storage error:', storageError);
      return NextResponse.json({ error: 'Failed to upload to secure storage' }, { status: 500 });
    }

    if (isSlip && bookingId) {
      // 6. Save metadata to DB
      const booking = await prisma.booking.findUnique({ where: { bookingId } });
      if (booking) {
        // Find existing slip or create new one
        const existingSlip = await prisma.paymentSlip.findUnique({
          where: { bookingId: booking.id }
        });
        
        let paymentSlip;
        if (existingSlip) {
           paymentSlip = await prisma.paymentSlip.update({
             where: { id: existingSlip.id },
             data: {
               storagePath: storagePath,
               originalFilename: file.name,
               mimeType: file.type,
               fileSize: file.size,
               verificationStatus: "PENDING"
             }
           });
        } else {
           paymentSlip = await prisma.paymentSlip.create({
             data: {
               bookingId: booking.id, // Reference the internal UUID
               userId: userId,
               storagePath: storagePath,
               originalFilename: file.name,
               mimeType: file.type,
               fileSize: file.size,
             }
           });
        }

        // 7. Update booking status
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'PENDING',
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Payment slip uploaded successfully. Status: Pending verification',
          paymentSlipId: paymentSlip.id,
        });
      }
    }

    // For non-slip uploads (like IDs), just return success without public URL
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully.',
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
