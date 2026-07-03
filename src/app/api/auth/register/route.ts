import { NextRequest, NextResponse } from "next/server";
import { dbInsert, dbUpdate, authCreateUser } from "@/lib/supabase";

const CODES = new Set(Array.from({ length: 30 }, (_, i) => `STELLA-${String(i + 1).padStart(3, "0")}`));
// 记录已使用的邀请码
const usedCodes = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { email, password, inviteCode, nickname } = await req.json();
    if (!email || !password || !inviteCode || !nickname)
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });

    const code = inviteCode.trim().toUpperCase();
    if (!CODES.has(code)) return NextResponse.json({ error: "邀请码无效" }, { status: 400 });
    if (usedCodes.has(code)) return NextResponse.json({ error: "该邀请码已被使用" }, { status: 400 });
    usedCodes.add(code);

    let authUser: any;
    try { authUser = await authCreateUser(email, password); } catch (e: any) {
      return NextResponse.json({ error: e.message || "创建用户失败" }, { status: 400 });
    }

    // 尝试创建档案，失败不影响注册（无数据库时降级运行）
    let profileId = authUser.id;
    try {
      const profile = await dbInsert("profiles", { auth_id: authUser.id, email, nickname: nickname.trim(), invite_code: code });
      if (profile && profile.id) profileId = profile.id;
    } catch {
      console.warn("创建档案失败（忽略，用户已创建）");
    }

    // 尝试标记邀请码已使用，失败忽略
    try {
      await dbUpdate("invite_codes", { is_used: true, used_by: profileId, used_at: new Date().toISOString() }, `code=eq.${code}`);
    } catch {
      console.warn("邀请码标记失败（忽略）");
    }

    return NextResponse.json({ success: true, user: { id: profileId, email, nickname } });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
