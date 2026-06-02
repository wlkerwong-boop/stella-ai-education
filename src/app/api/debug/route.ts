import { NextRequest, NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET() {
  const tests: any[] = [];
  
  // Test 1: raw fetch to Supabase
  async function t(name: string, f: () => Promise<any>) {
    try { const r = await f(); tests.push({name, ok: true, result: JSON.stringify(r).slice(0,100)}); }
    catch(e: any) { tests.push({name, ok: false, error: e.message.slice(0,100)}); }
  }

  await t("invite_codes", async () => {
    const r = await fetch(`${url}/rest/v1/invite_codes?code=eq.STELLA-001&select=code,is_used`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    return r.json();
  });

  await t("invite_codes_all", async () => {
    const r = await fetch(`${url}/rest/v1/invite_codes?select=code&limit=3`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    return r.json();
  });

  return NextResponse.json({ url_ok: !!url, key_ok: !!key, tests });
}
