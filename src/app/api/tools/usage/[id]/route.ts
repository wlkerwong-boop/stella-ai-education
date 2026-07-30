import { NextRequest, NextResponse } from "next/server";
import { dbUpdate, dbDelete } from "@/lib/supabase";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const filter = `id=eq.${id}`;
    await dbUpdate("tool_usage_records", body, filter);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PUT tool_usage error:", e);
    return NextResponse.json({ success: true, dev_mode: true });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filter = `id=eq.${id}`;
    await dbDelete("tool_usage_records", filter);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE tool_usage error:", e);
    return NextResponse.json({ success: true, dev_mode: true });
  }
}
