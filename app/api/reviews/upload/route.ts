import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUPABASE_BUCKET_NAME } from '@/lib/supabase/config';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload JPEG, PNG, or WEBP images.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image file size exceeds maximum limit of 4MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || '.jpg';
    const folder = 'reviews';
    const fileName = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${fileExt}`;

    // 1. Try Supabase Storage if configured
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      try {
        const { error: uploadError } = await supabaseAdmin.storage
          .from(SUPABASE_BUCKET_NAME)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .getPublicUrl(fileName);

          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
          });
        }
      } catch (err) {
        console.warn('Supabase upload exception for review, using local storage fallback:', err);
      }
    }

    // 2. Local filesystem fallback
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const localFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${fileExt}`;
    const localFilePath = path.join(uploadDir, localFileName);
    await fs.writeFile(localFilePath, buffer);

    const publicUrl = `/uploads/${folder}/${localFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error: any) {
    console.error('Review image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Image upload failed.' },
      { status: 500 }
    );
  }
}
