import { NextRequest, NextResponse } from "next/server";

// 有效邀请码列表（非机密，可硬编码）
const VALID_CODES = new Set(
  Array.from({ length: 30 }, (_, i) => `STELLA-${String(i + 1).padStart(3, "0")}`)
);

// 调用内部 stella-admin 路由（使用 service_role key）
async function adminCall(req: NextRequest, action: string, params: any = {}) {
  const apiUrl = new URL("/api/stella-admin", req.url);
  const res = await fetch(apiUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `stella-admin ${action} 失败`);
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, inviteCode, nickname } = await req.json();
    if (!email || !password || !inviteCode || !nickname)
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });

    const code = inviteCode.trim().toUpperCase();

    // 1. 检查邀请码是否在有效列表中
    if (!VALID_CODES.has(code))
      return NextResponse.json({ error: "邀请码无效" }, { status: 400 });

    // 2. 从数据库查询邀请码是否已被使用
    try {
      const checkResult = await adminCall(req, "dbGet", {
        table: "invite_codes",
        filter: `code=eq.${code}`,
        select: "id,code,is_used",
      });
      if (checkResult.result && checkResult.result.is_used) {
        return NextResponse.json({ error: "该邀请码已被使用" }, { status: 400 });
      }
    } catch (e: any) {
      console.warn("邀请码查询失败:", e.message);
      // 查询失败不阻塞注册流程（可能是表不存在，兼容降级）
    }

    // 3. 创建用户（通过 service_role）
    let authUser: any;
    try {
      const result = await adminCall(req, "createUser", { email, password });
      authUser = result.user;
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "创建用户失败" }, { status: 400 });
    }

    // 4. 创建档案
    let profileId = authUser.id;
    try {
      const profileResult = await adminCall(req, "dbInsert", {
        table: "profiles",
        data: {
          auth_id: authUser.id,
          email,
          nickname: nickname.trim(),
          invite_code: code,
        },
      });
      if (profileResult.result && profileResult.result.id) {
        profileId = profileResult.result.id;
      }
    } catch {
      console.warn("创建档案失败（忽略，用户已创建）");
    }

    // 5. 标记邀请码已使用
    try {
      await adminCall(req, "dbUpdate", {
        table: "invite_codes",
        data: {
          is_used: true,
          used_by: profileId,
          used_at: new Date().toISOString(),
        },
        filter: `code=eq.${code}`,
      });
    } catch {
      console.warn("邀请码标记失败（忽略）");
    }

    return NextResponse.json({ success: true, user: { id: profileId, email, nickname } });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
