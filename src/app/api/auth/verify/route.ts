import { NextRequest, NextResponse } from "next/server";

// 预置邀请码（服务端亦需维护一份）
const VALID_CODES: Record<string, boolean> = {
  "STELLA-001": false,
  "STELLA-002": false,
  "STELLA-003": false,
  "STELLA-004": false,
  "STELLA-005": false,
  "STELLA-006": false,
  "STELLA-007": false,
  "STELLA-008": false,
  "STELLA-009": false,
  "STELLA-010": false,
};

// 已使用的邀请码（服务端记录）
// 注意：生产环境应使用数据库存储
const usedCodes = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const trimmed = (code || "").trim().toUpperCase();

    if (!trimmed) {
      return NextResponse.json({ valid: false, message: "请输入邀请码" });
    }

    if (VALID_CODES[trimmed] === undefined) {
      return NextResponse.json({ valid: false, message: "邀请码不存在，请确认后重试" });
    }

    if (usedCodes.has(trimmed)) {
      return NextResponse.json({ valid: false, message: "该邀请码已被使用" });
    }

    // 标记已使用（客户端注册成功后会同步标记）
    usedCodes.add(trimmed);

    return NextResponse.json({ valid: true, message: "邀请码验证通过" });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ valid: false, message: "验证服务异常" });
  }
}
