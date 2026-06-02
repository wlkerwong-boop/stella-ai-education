import { NextRequest, NextResponse } from "next/server";
import { getUser, selectOne, updateRows, deleteRows } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
    let user: any;
    try { user = await getUser(auth.replace("Bearer ", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }

    const profile = await selectOne("profiles", { auth_id: `eq.${user.id}`, select: "id" });
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    const updates = await req.json();
    const result = await updateRows("tool_records", updates, { id: `eq.${id}`, user_id: `eq.${profile.id}` });
    if (!result) return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    return NextResponse.json({ record: result });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
    let user: any;
    try { user = await getUser(auth.replace("Bearer ", "")); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }

    const profile = await selectOne("profiles", { auth_id: `eq.${user.id}`, select: "id" });
    if (!profile) return NextResponse.json({ error: "档案不存在" }, { status: 404 });

    await deleteRows("tool_records", { id: `eq.${id}`, user_id: `eq.${profile.id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
