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
    try { profile = await getProfile(auth.replace("Bearer ", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const url = new URL(req.url);
    let filter = `user_id=eq.${profile.id}`;
    const tt = url.searchParams.get("toolType");
    if (tt) filter += `&tool_type=eq.${tt}`;
    const vis = url.searchParams.get("visibility");
    if (vis) filter += `&visibility=eq.${vis}`;

    const records = await dbList("tool_records", filter);
    return NextResponse.json({ records });
  } catch (e) {
    console.error("GET tools error:", e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try { profile = await getProfile(auth.replace("Bearer", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const { toolType, title, content, visibility, tags } = await req.json();
    const record = await dbInsert("tool_records", {
      user_id: profile.id, tool_type: toolType, title: title || "",
      content: content || {}, visibility: visibility || "private", tags: tags || [],
    });
    return NextResponse.json({ record });
  } catch (e) {
    console.error("POST tools error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
