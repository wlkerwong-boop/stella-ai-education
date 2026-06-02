import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const trimmed = (code || "").trim().toUpperCase();

    if (!trimmed) {
      return NextResponse.json({ valid: false, message: "请输入邀请码" });
    }

    // 查数据库中的邀请码
    const { data, error } = await supabase
      .from("invite_codes")
      .select("code, is_used")
      .eq("code", trimmed)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, message: "邀请码不存在，请确认后重试" });
    }

    if (data.is_used) {
      return NextResponse.json({ valid: false, message: "该邀请码已被使用" });
    }

    return NextResponse.json({ valid: true, message: "邀请码验证通过" });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ valid: false, message: "验证服务异常" });
  }
}
