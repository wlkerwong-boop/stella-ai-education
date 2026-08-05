import { NextRequest, NextResponse } from "next/server";
import { dbList, dbInsert } from "@/lib/supabase";
import { getProfileForToken, parseBearerToken } from "@/lib/request-auth";

export async function GET(req: NextRequest) {
  try {
    const token = parseBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try {
      profile = await getProfileForToken(token);
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

    const records = await dbList("tool_usage_records", filter, token);
    return NextResponse.json({ records });
  } catch (e) {
    console.error("GET tool_usage error:", e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = parseBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try {
      profile = await getProfileForToken(token);
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
    }, token);

    return NextResponse.json({ record });
  } catch (e) {
    console.error("POST tool_usage error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
