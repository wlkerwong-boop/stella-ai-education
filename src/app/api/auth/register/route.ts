import { NextRequest, NextResponse } from "next/server";
import { createUser, deleteUser, selectOne, insertOne, updateRows } from "@/lib/supabase";

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

    // 检查邀请码
    const existing = await selectOne("invite_codes", { code: `eq.${code}`, select: "is_used" });
    if (!existing) return NextResponse.json({ error: "邀请码不存在" }, { status: 400 });
    if (existing.is_used) return NextResponse.json({ error: "该邀请码已被使用" }, { status: 400 });

    // 创建 Auth 用户
    let authUser: any;
    try { authUser = await createUser(email, password); }
    catch (e: any) { return NextResponse.json({ error: e.message || "创建用户失败" }, { status: 400 }); }

    // 创建档案
    try {
      const profile = await insertOne("profiles", {
        auth_id: authUser.id, email, nickname: nickname.trim(), invite_code: code,
      });
      await updateRows("invite_codes", { is_used: true, used_by: profile.id, used_at: new Date().toISOString() }, { code: `eq.${code}` });
      return NextResponse.json({ success: true, user: { id: profile.id, email, nickname: profile.nickname } });
    } catch {
      await deleteUser(authUser.id);
      return NextResponse.json({ error: "创建档案失败" }, { status: 500 });
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
