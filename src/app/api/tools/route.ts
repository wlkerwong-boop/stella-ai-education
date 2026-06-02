import { NextRequest, NextResponse } from "next/server";
import { getUser, selectOne, selectList, insertOne } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
    let user: any;
    try { user = await getUser(auth.replace("Bearer ", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }

    const profile = await selectOne("profiles", { auth_id: `eq.${user.id}`, select: "id" });
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const url = new URL(req.url);
    const filters: Record<string, string> = { user_id: `eq.${profile.id}`, select: "*", order: "created_at.desc" };
    const tt = url.searchParams.get("toolType");
    if (tt) filters.tool_type = `eq.${tt}`;
    const vis = url.searchParams.get("visibility");
    if (vis) filters.visibility = `eq.${vis}`;

    const records = await selectList("tool_records", filters);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("GET tools error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
    let user: any;
    try { user = await getUser(auth.replace("Bearer ", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }

    const profile = await selectOne("profiles", { auth_id: `eq.${user.id}`, select: "id" });
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const { toolType, title, content, visibility, tags } = await req.json();
    const record = await insertOne("tool_records", {
      user_id: profile.id, tool_type: toolType, title: title || "",
      content: content || {}, visibility: visibility || "private", tags: tags || [],
    });
    return NextResponse.json({ record });
  } catch (error) {
    console.error("POST tools error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
