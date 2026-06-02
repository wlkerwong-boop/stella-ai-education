import { NextRequest, NextResponse } from "next/server";
import { authLogin, dbGet } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });

    let data: any;
    try { data = await authLogin(email, password); } catch {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    let profile: any = null;
    try { profile = await dbGet("profiles", `auth_id=eq.${data.user.id}`, "id,nickname,email,invite_code"); } catch {}

    return NextResponse.json({
      success: true,
      session: { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at },
      user: { id: profile?.id, email: data.user.email, nickname: profile?.nickname, invite_code: profile?.invite_code },
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
