import { NextRequest, NextResponse } from "next/server";
import { selectOne } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const trimmed = (code || "").trim().toUpperCase();
    if (!trimmed) return NextResponse.json({ valid: false, message: "请输入邀请码" });

    const data = await selectOne("invite_codes", { code: `eq.${trimmed}`, select: "is_used" });
    if (!data) return NextResponse.json({ valid: false, message: "邀请码不存在，请确认后重试" });
    if (data.is_used) return NextResponse.json({ valid: false, message: "该邀请码已被使用" });

    return NextResponse.json({ valid: true, message: "邀请码验证通过" });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ valid: false, message: "验证服务异常" });
  }
}
