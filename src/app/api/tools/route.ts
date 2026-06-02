import { NextRequest, NextResponse } from "next/server";
import { getUser, select, insert, selectSingle } from "@/lib/supabase";

async function getProfileByAuth(authId: string) {
  try {
    return await selectSingle("profiles", { auth_id: `eq.${authId}`, select: "id,nickname" }, true);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let user: any;
    try {
      user = await getUser(authHeader.replace("Bearer ", ""));
    } catch {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const profile = await getProfileByAuth(user.id);
    if (!profile) return NextResponse.json({ error: "用户档案不存在" }, { status: 404 });

    const url = new URL(req.url);
    const toolType = url.searchParams.get("toolType");
    const visibility = url.searchParams.get("visibility");

    let query: Record<string, string> = {
      user_id: `eq.${profile.id}`,
      select: "*",
      order: "created_at.desc",
    };
    if (toolType) query.tool_type = `eq.${toolType}`;
    if (visibility) query.visibility = `eq.${visibility}`;

    const records = await select("tool_records", query, true);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("GET tools error:", error);
    return NextResponse.json({ error: "获取记录失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let user: any;
    try {
      user = await getUser(authHeader.replace("Bearer ", ""));
    } catch {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const profile = await getProfileByAuth(user.id);
    if (!profile) return NextResponse.json({ error: "用户档案不存在" }, { status: 404 });

    const { toolType, title, content, visibility, tags } = await req.json();

    const records = await insert("tool_records", {
      user_id: profile.id,
      tool_type: toolType,
      title: title || "",
      content: content || {},
      visibility: visibility || "private",
      tags: tags || [],
    }, true);

    const record = Array.isArray(records) ? records[0] : records;
    return NextResponse.json({ record });
  } catch (error) {
    console.error("POST tools error:", error);
    return NextResponse.json({ error: "创建记录失败" }, { status: 500 });
  }
}
