import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUPABASE_BUCKET_NAME } from '@/lib/supabase/config';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize admin
    await requireAuth();

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'promotions';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 5MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || '.jpg';
    const fileName = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${fileExt}`;

    // 3. Try Supabase Storage first if admin client available
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      try {
        // Ensure bucket exists
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === SUPABASE_BUCKET_NAME);
        if (!bucketExists) {
          await supabaseAdmin.storage.createBucket(SUPABASE_BUCKET_NAME, {
            public: true,
          });
        }

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
            storageProvider: 'SUPABASE',
          });
        }
        console.warn('Supabase upload failed, falling back to local storage:', uploadError);
      } catch (storageError) {
        console.warn('Supabase storage exception, falling back to local:', storageError);
      }
    }

    // 4. Fallback to local storage in public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const localFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${fileExt}`;
    const localFilePath = path.join(uploadDir, localFileName);
    await fs.writeFile(localFilePath, buffer);

    const publicUrl = `/uploads/${folder}/${localFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storageProvider: 'LOCAL',
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
