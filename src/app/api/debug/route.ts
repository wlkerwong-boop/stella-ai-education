import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const env = {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "exists" : "missing",
    KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "exists" : "missing",
    ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "exists" : "missing",
    SILICON: process.env.SILICONFLOW_API_KEY ? "exists" : "missing",
  };
  return NextResponse.json({ env });
}
