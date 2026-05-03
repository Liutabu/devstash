import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getItemById } from '@/lib/db/items';
import { getFromR2 } from '@/lib/r2';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemById(id, session.user.id);
  if (!item || !item.fileUrl) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { body, contentType, contentLength } = await getFromR2(item.fileUrl);

  const forceDownload = req.nextUrl.searchParams.get('download') === '1';
  const encoded = encodeURIComponent(item.fileName ?? 'file');
  const disposition = forceDownload
    ? `attachment; filename*=UTF-8''${encoded}`
    : 'inline';

  const headers = new Headers();
  headers.set('Content-Disposition', disposition);
  if (contentType) headers.set('Content-Type', contentType);
  if (contentLength) headers.set('Content-Length', String(contentLength));

  return new NextResponse(body, { headers });
}
