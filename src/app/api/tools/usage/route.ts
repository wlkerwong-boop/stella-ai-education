import { NextRequest, NextResponse } from "next/server";
import { authGetUser, dbGet, dbList, dbInsert } from "@/lib/supabase";

async function getProfile(token: string) {
  const user = await authGetUser(token);
  return dbGet("profiles", `auth_id=eq.${user.id}`, "id,nickname");
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try {
      profile = await getProfile(auth.replace("Bearer ", ""));
    } catch {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const url = new URL(req.url);
    let filter = `user_id=eq.${profile.id}`;
    const toolId = url.searchParams.get("tool_definition_id");
    if (toolId) filter += `&tool_definition_id=eq.${toolId}`;
    const status = url.searchParams.get("status");
    if (status) filter += `&status=eq.${status}`;

    const records = await dbList("tool_usage_records", filter);
    return NextResponse.json({ records });
  } catch (e) {
    console.error("GET tool_usage error:", e);
    // 表可能不存在 → dev fallback
    return NextResponse.json({ records: [], dev_mode: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try {
      profile = await getProfile(auth.replace("Bearer ", ""));
    } catch {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const body = await req.json();
    const record = await dbInsert("tool_usage_records", {
      user_id: profile.id,
      tool_definition_id: body.tool_definition_id,
      tool_version: body.tool_version || "1.0.0",
      child_stage: body.child_stage || "",
      input_data: body.input_data || {},
      output_data: body.output_data || {},
      orid_summary: body.orid_summary || {},
      growth_event_id: body.growth_event_id || null,
      visibility: body.visibility || "private",
      status: body.status || "completed",
    });

    return NextResponse.json({ record });
  } catch (e) {
    console.error("POST tool_usage error:", e);
    // 表可能不存在 → dev fallback
    return NextResponse.json({
      record: {
        ...(await req.json().catch(() => ({}))),
        id: `dev-${Date.now()}`,
        created_at: new Date().toISOString(),
      },
      dev_mode: true,
    });
  }
}
