import { NextRequest, NextResponse } from "next/server";
import { createUser, deleteUser, selectSingle, insert, update as dbUpdate } from "@/lib/supabase";

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
    try {
      const existingCode = await selectSingle("invite_codes", { code: `eq.${code}`, select: "is_used" }, true);
      if (existingCode?.is_used) {
        return NextResponse.json({ error: "该邀请码已被使用" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "验证邀请码失败" }, { status: 500 });
    }

    // 创建 Supabase Auth 用户
    let authUser: any;
    try {
      authUser = await createUser(email, password);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "创建用户失败" }, { status: 400 });
    }

    // 创建用户档案
    try {
      const profiles = await insert("profiles", {
        auth_id: authUser.id,
        email,
        nickname: nickname.trim(),
        invite_code: code,
      }, true);
      const profile = Array.isArray(profiles) ? profiles[0] : profiles;

      // 标记邀请码已使用
      await dbUpdate("invite_codes", { is_used: true, used_by: profile.id, used_at: new Date().toISOString() }, { code: `eq.${code}` }, true);

      return NextResponse.json({
        success: true,
        user: { id: profile.id, email, nickname: profile.nickname },
      });
    } catch {
      // 回滚：删除已创建的 Auth 用户
      await deleteUser(authUser.id);
      return NextResponse.json({ error: "创建用户档案失败" }, { status: 500 });
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
