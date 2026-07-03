import { NextRequest, NextResponse } from "next/server";

const CODES = new Set(Array.from({ length: 30 }, (_, i) => `STELLA-${String(i + 1).padStart(3, "0")}`));
// 记录已使用的邀请码（内存中，重启后重置）
const usedCodes = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const c = (code || "").trim().toUpperCase();
    if (!c) return NextResponse.json({ valid: false, message: "请输入邀请码" });

    if (!CODES.has(c)) return NextResponse.json({ valid: false, message: "邀请码无效" });
    if (usedCodes.has(c)) return NextResponse.json({ valid: false, message: "该邀请码已被使用" });

    return NextResponse.json({ valid: true, message: "验证通过" });
  } catch {
    return NextResponse.json({ valid: false, message: "验证服务异常" });
  }
}
