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
  "STELLA-011": false,
  "STELLA-012": false,
  "STELLA-013": false,
  "STELLA-014": false,
  "STELLA-015": false,
  "STELLA-016": false,
  "STELLA-017": false,
  "STELLA-018": false,
  "STELLA-019": false,
  "STELLA-020": false,
  "STELLA-021": false,
  "STELLA-022": false,
  "STELLA-023": false,
  "STELLA-024": false,
  "STELLA-025": false,
  "STELLA-026": false,
  "STELLA-027": false,
  "STELLA-028": false,
  "STELLA-029": false,
  "STELLA-030": false,
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
