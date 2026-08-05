import { NextRequest, NextResponse } from "next/server";
import { dbUpdate, dbDelete } from "@/lib/supabase";
import { getProfileForToken, parseBearerToken } from "@/lib/request-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = parseBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try { profile = await getProfileForToken(token); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "不存在" }, { status: 404 });

    const updates = await req.json();
    const r = await dbUpdate("tool_records", updates, `id=eq.${id}&user_id=eq.${profile.id}`, token);
    return NextResponse.json({ record: r });
  } catch (e) {
    console.error("PUT error:", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = parseBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

    let profile: any;
    try { profile = await getProfileForToken(token); }
    catch { return NextResponse.json({ error: "未登录" }, { status: 401 }); }
    if (!profile) return NextResponse.json({ error: "不存在" }, { status: 404 });

    await dbDelete("tool_records", `id=eq.${id}&user_id=eq.${profile.id}`, token);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE error:", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
