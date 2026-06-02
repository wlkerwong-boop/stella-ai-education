import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbInsert, dbUpdate, authCreateUser, authDeleteUser } from "@/lib/supabase";

const CODES = new Set(Array.from({ length: 30 }, (_, i) => `STELLA-${String(i + 1).padStart(3, "0")}`));

export async function POST(req: NextRequest) {
  try {
    const { email, password, inviteCode, nickname } = await req.json();
    if (!email || !password || !inviteCode || !nickname)
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });

    const code = inviteCode.trim().toUpperCase();
    if (!CODES.has(code)) return NextResponse.json({ error: "邀请码无效" }, { status: 400 });

    let existing: any;
    try { existing = await dbGet("invite_codes", `code=eq.${code}`, "is_used"); } catch {
      return NextResponse.json({ error: "验证邀请码失败" }, { status: 500 });
    }
    if (!existing) return NextResponse.json({ error: "邀请码不存在" }, { status: 400 });
    if (existing.is_used) return NextResponse.json({ error: "该邀请码已被使用" }, { status: 400 });

    let authUser: any;
    try { authUser = await authCreateUser(email, password); } catch (e: any) {
      return NextResponse.json({ error: e.message || "创建用户失败" }, { status: 400 });
    }

    try {
      const profile = await dbInsert("profiles", { auth_id: authUser.id, email, nickname: nickname.trim(), invite_code: code });
      await dbUpdate("invite_codes", { is_used: true, used_by: profile.id, used_at: new Date().toISOString() }, `code=eq.${code}`);
      return NextResponse.json({ success: true, user: { id: profile.id, email, nickname: profile.nickname } });
    } catch {
      await authDeleteUser(authUser.id).catch(() => {});
      return NextResponse.json({ error: "创建档案失败" }, { status: 500 });
    }
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
