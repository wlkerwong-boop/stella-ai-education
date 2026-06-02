import { NextRequest, NextResponse } from "next/server";
import { dbGet } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const c = (code || "").trim().toUpperCase();
    if (!c) return NextResponse.json({ valid: false, message: "请输入邀请码" });

    try {
      const d = await dbGet("invite_codes", `code=eq.${c}`, "is_used");
      if (!d) return NextResponse.json({ valid: false, message: "邀请码不存在" });
      if (d.is_used) return NextResponse.json({ valid: false, message: "该邀请码已被使用" });
      return NextResponse.json({ valid: true, message: "验证通过" });
    } catch {
      return NextResponse.json({ valid: false, message: "邀请码不存在" });
    }
  } catch {
    return NextResponse.json({ valid: false, message: "验证服务异常" });
  }
}
