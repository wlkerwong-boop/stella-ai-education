import { NextRequest, NextResponse } from "next/server";
import { getUser, update, remove, selectSingle } from "@/lib/supabase";

async function getProfileByAuth(authId: string) {
  try {
    return await selectSingle("profiles", { auth_id: `eq.${authId}`, select: "id" }, true);
  } catch {
    return null;
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let user: any;
    try { user = await getUser(authHeader.replace("Bearer ", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }

    const profile = await getProfileByAuth(user.id);
    if (!profile) return NextResponse.json({ error: "用户档案不存在" }, { status: 404 });

    const updates = await req.json();
    const records = await update("tool_records", updates, { id: `eq.${id}`, user_id: `eq.${profile.id}` }, true);
    const record = Array.isArray(records) ? records[0] : records;

    if (!record) return NextResponse.json({ error: "记录不存在或无权限" }, { status: 404 });
    return NextResponse.json({ record });
  } catch (error) {
    console.error("PUT tool error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let user: any;
    try { user = await getUser(authHeader.replace("Bearer ", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }

    const profile = await getProfileByAuth(user.id);
    if (!profile) return NextResponse.json({ error: "用户档案不存在" }, { status: 404 });

    await remove("tool_records", { id: `eq.${id}`, user_id: `eq.${profile.id}` }, true);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE tool error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
