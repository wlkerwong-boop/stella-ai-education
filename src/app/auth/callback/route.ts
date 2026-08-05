import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const requestedNext = request.nextUrl.searchParams.get('next') || '/profile';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/profile';
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.redirect(new URL('/auth/login?error=config', request.url));
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(`${next}${next.includes('?') ? '&' : '?'}verified=1`, request.url));
    }
  }
  return NextResponse.redirect(new URL('/auth/login?error=verification', request.url));
}
