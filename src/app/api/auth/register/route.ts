import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

const VALID_CODES = new Set([
  "STELLA-001", "STELLA-002", "STELLA-003", "STELLA-004", "STELLA-005",
  "STELLA-006", "STELLA-007", "STELLA-008", "STELLA-009", "STELLA-010",
  "STELLA-011", "STELLA-012", "STELLA-013", "STELLA-014", "STELLA-015",
  "STELLA-016", "STELLA-017", "STELLA-018", "STELLA-019", "STELLA-020",
  "STELLA-021", "STELLA-022", "STELLA-023", "STELLA-024", "STELLA-025",
  "STELLA-026", "STELLA-027", "STELLA-028", "STELLA-029", "STELLA-030",
]);

export async function POST(req: NextRequest) {
  try {
    const { email, password, inviteCode, nickname } = await req.json();

    if (!email || !password || !inviteCode || !nickname) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const code = inviteCode.trim().toUpperCase();
    if (!VALID_CODES.has(code)) {
      return NextResponse.json({ error: "邀请码无效" }, { status: 400 });
    }

    // 检查邀请码是否已被使用
    const { data: existingCode } = await supabase
      .from("invite_codes")
      .select("is_used")
      .eq("code", code)
      .single();

    if (existingCode?.is_used) {
      return NextResponse.json({ error: "该邀请码已被使用" }, { status: 400 });
    }

    // 创建 Supabase Auth 用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 创建用户档案
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        auth_id: authData.user.id,
        email,
        nickname: nickname.trim(),
        invite_code: code,
      })
      .select()
      .single();

    if (profileError) {
      // 回滚：删除已创建的 Auth 用户
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "创建用户档案失败" }, { status: 500 });
    }

    // 标记邀请码已使用
    await supabase
      .from("invite_codes")
      .update({ is_used: true, used_by: profile.id, used_at: new Date().toISOString() })
      .eq("code", code);

    return NextResponse.json({
      success: true,
      user: { id: profile.id, email, nickname: profile.nickname },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
