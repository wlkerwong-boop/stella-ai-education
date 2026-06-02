import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    );

    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 获取用户档案ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "用户档案不存在" }, { status: 404 });
    }

    const url = new URL(req.url);
    const toolType = url.searchParams.get("toolType");
    const visibility = url.searchParams.get("visibility");

    let query = supabase
      .from("tool_records")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (toolType) query = query.eq("tool_type", toolType);
    if (visibility) query = query.eq("visibility", visibility);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ records: data });
  } catch (error) {
    console.error("GET tools error:", error);
    return NextResponse.json({ error: "获取记录失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    );

    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, nickname")
      .eq("auth_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "用户档案不存在" }, { status: 404 });
    }

    const { toolType, title, content, visibility, tags } = await req.json();

    const { data, error } = await supabase
      .from("tool_records")
      .insert({
        user_id: profile.id,
        tool_type: toolType,
        title: title || "",
        content: content || {},
        visibility: visibility || "private",
        tags: tags || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ record: data });
  } catch (error) {
    console.error("POST tools error:", error);
    return NextResponse.json({ error: "创建记录失败" }, { status: 500 });
  }
}
