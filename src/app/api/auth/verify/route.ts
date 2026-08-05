import { NextResponse, type NextRequest } from 'next/server';
import { isKnownInviteCode, normalizeInviteCode } from '@/lib/invite-code';
import { FixedWindowRateLimiter } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

const globalRateLimit = globalThis as typeof globalThis & {
  stellaInviteLimiter?: FixedWindowRateLimiter;
};
const limiter = globalRateLimit.stellaInviteLimiter ??= new FixedWindowRateLimiter(10, 60_000);

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  if (!limiter.allow(clientIp)) {
    return NextResponse.json(
      { valid: false, message: '验证次数过多，请一分钟后再试' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const code = normalizeInviteCode(typeof body.code === 'string' ? body.code : '');
  if (!isKnownInviteCode(code)) {
    return NextResponse.json({ valid: false, message: '邀请码无效' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { valid: false, message: '邀请码服务尚未完成配置' },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from('invite_codes')
    .select('id,is_used')
    .eq('code', code)
    .maybeSingle();
  if (error) {
    console.error('[invite verification]', error.message);
    return NextResponse.json(
      { valid: false, message: '邀请码服务暂时不可用' },
      { status: 503 }
    );
  }
  if (!data) {
    return NextResponse.json({ valid: false, message: '邀请码无效' }, { status: 400 });
  }
  if (data.is_used) {
    return NextResponse.json({ valid: false, message: '该邀请码已被使用' }, { status: 409 });
  }

  return NextResponse.json({ valid: true, message: '验证通过' });
}
