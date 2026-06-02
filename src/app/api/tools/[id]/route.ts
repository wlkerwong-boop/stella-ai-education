import { NextRequest, NextResponse } from "next/server";
import { authGetUser, dbGet, dbUpdate, dbDelete } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try { const user = await authGetUser(auth.replace("Bearer ", "")); profile = await dbGet("profiles", `auth_id=eq.${user.id}`, "id"); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "不存在" }, { status: 404 });

    const updates = await req.json();
    const r = await dbUpdate("tool_records", updates, `id=eq.${id}&user_id=eq.${profile.id}`);
    return NextResponse.json({ record: r });
  } catch (e) {
    console.error("PUT error:", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("Authorization");
    if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try { const user = await authGetUser(auth.replace("Bearer ", "")); profile = await dbGet("profiles", `auth_id=eq.${user.id}`, "id"); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "不存在" }, { status: 404 });

    await dbDelete("tool_records", `id=eq.${id}&user_id=eq.${profile.id}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE error:", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
