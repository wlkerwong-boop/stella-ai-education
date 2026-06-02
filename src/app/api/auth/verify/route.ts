import { NextRequest, NextResponse } from "next/server";

// 邀请码列表（服务端白名单校验）
// 注意：验证码是否"已使用"由客户端 localStorage 管理，
// 服务端仅校验验证码是否在白名单中 —— 这样才能跨设备多次使用同一验证码。
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
    const { code } = await req.json();
    const trimmed = (code || "").trim().toUpperCase();

    if (!trimmed) {
      return NextResponse.json({ valid: false, message: "请输入邀请码" });
    }

    if (!VALID_CODES.has(trimmed)) {
      return NextResponse.json({ valid: false, message: "邀请码不存在，请确认后重试" });
    }

    // 服务端不做"已使用"标记，仅校验白名单。
    // 客户端 localStorage 负责记录哪些验证码已被当前设备使用。
    return NextResponse.json({ valid: true, message: "邀请码验证通过" });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ valid: false, message: "验证服务异常" });
  }
}
