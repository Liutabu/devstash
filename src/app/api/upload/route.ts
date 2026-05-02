import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import path from 'path';
import { auth } from '@/auth';
import { uploadToR2 } from '@/lib/r2';

const IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

const FILE_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/toml',
]);

const IMAGE_MAX = 5 * 1024 * 1024;
const FILE_MAX = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const mimeType = file.type;
  const isImage = IMAGE_TYPES.has(mimeType);
  const isFile = FILE_TYPES.has(mimeType);

  if (!isImage && !isFile) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 422 });
  }

  const maxSize = isImage ? IMAGE_MAX : FILE_MAX;
  if (file.size > maxSize) {
    const maxMb = maxSize / 1024 / 1024;
    return NextResponse.json({ error: `File exceeds ${maxMb}MB limit` }, { status: 422 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const key = `uploads/${session.user.id}/${randomUUID()}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadToR2(key, buffer, mimeType);

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
  });
}
