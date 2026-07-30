import { NextRequest, NextResponse } from "next/server";

// 有效邀请码列表（非机密）
const VALID_CODES = new Set(
  Array.from({ length: 30 }, (_, i) => `STELLA-${String(i + 1).padStart(3, "0")}`)
);

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const c = (code || "").trim().toUpperCase();
    if (!c) return NextResponse.json({ valid: false, message: "请输入邀请码" });

    // 检查是否在有效列表中
    if (!VALID_CODES.has(c))
      return NextResponse.json({ valid: false, message: "邀请码无效" });

    // 查询数据库确认未被使用
    try {
      const apiUrl = new URL("/api/stella-admin", req.url);
      const res = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dbGet",
          table: "invite_codes",
          filter: `code=eq.${c}`,
          select: "id,code,is_used",
        }),
      });
      const data = await res.json();
      if (data.result && data.result.is_used) {
        return NextResponse.json({ valid: false, message: "该邀请码已被使用" });
      }
    } catch (e: any) {
      // 查询失败不阻塞验证（表可能不存在，兼容降级）
      console.warn("邀请码查询失败:", e.message);
    }

    return NextResponse.json({ valid: true, message: "验证通过" });
  } catch {
    return NextResponse.json({ valid: false, message: "验证服务异常" });
  }
}
