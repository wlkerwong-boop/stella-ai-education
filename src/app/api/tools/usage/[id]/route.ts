import { NextResponse, type NextRequest } from 'next/server';
import { dbDelete, dbUpdate } from '@/lib/supabase';
import { getProfileForToken, parseBearerToken } from '@/lib/request-auth';

async function authenticate(request: NextRequest) {
  const token = parseBearerToken(request.headers.get('Authorization'));
  if (!token) return null;
  const profile = await getProfileForToken(token);
  return profile ? { profile, token } : null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: '未登录' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    await dbUpdate(
      'tool_usage_records',
      body,
      `id=eq.${id}&user_id=eq.${auth.profile.id}`,
      auth.token
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT tool_usage error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: '未登录' }, { status: 401 });
    const { id } = await params;
    await dbDelete(
      'tool_usage_records',
      `id=eq.${id}&user_id=eq.${auth.profile.id}`,
      auth.token
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE tool_usage error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
