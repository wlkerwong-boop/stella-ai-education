import { NextRequest, NextResponse } from "next/server";
import { dbList, dbInsert } from "@/lib/supabase";
import { getProfileForToken, parseBearerToken } from "@/lib/request-auth";

export async function GET(req: NextRequest) {
  try {
    const token = parseBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try { profile = await getProfileForToken(token); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const url = new URL(req.url);
    let filter = `user_id=eq.${profile.id}`;
    const tt = url.searchParams.get("toolType");
    if (tt) filter += `&tool_type=eq.${tt}`;
    const vis = url.searchParams.get("visibility");
    if (vis) filter += `&visibility=eq.${vis}`;

    const records = await dbList("tool_records", filter, token);
    return NextResponse.json({ records });
  } catch (e) {
    console.error("GET tools error:", e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = parseBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try { profile = await getProfileForToken(token); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const { toolType, title, content, visibility, tags } = await req.json();
    const record = await dbInsert("tool_records", {
      user_id: profile.id, tool_type: toolType, title: title || "",
      content: content || {}, visibility: visibility || "private", tags: tags || [],
    }, token);
    return NextResponse.json({ record });
  } catch (e) {
    console.error("POST tools error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
