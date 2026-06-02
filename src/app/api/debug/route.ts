import { NextRequest, NextResponse } from "next/server";

// 调试端点：检查 Supabase 连接
export async function GET(req: NextRequest) {
  const results: any = {};

  // 检查环境变量
  results.env = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlPrefix: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").slice(0, 20),
  };

  // 尝试直接查询
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  const testUrl = `${url}/rest/v1/invite_codes?code=eq.STELLA-001&select=code,is_used`;
  results.testUrl = testUrl.slice(0, 80);

  try {
    const res = await fetch(testUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/vnd.pgrst.object+json",
      },
    });
    results.status = res.status;
    results.body = (await res.text()).slice(0, 200);
  } catch (e: any) {
    results.error = e.message || String(e);
  }

  return NextResponse.json(results);
}
