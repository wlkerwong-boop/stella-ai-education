import { NextRequest, NextResponse } from "next/server";

const SB_URL = "https://tnmbesyjsftephqmwsmw.supabase.co";

function getServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

async function adminFetch(path: string, opts: any = {}) {
  const key = getServiceKey();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 未配置");
  const res = await fetch(`${SB_URL}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status}: ${t.slice(0, 200)}`);
  }
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, uid, table, data, filter, select } = await req.json();

    switch (action) {
      case "createUser": {
        if (!email || !password) {
          return NextResponse.json({ error: "缺少 email 或 password" }, { status: 400 });
        }
        const user = await adminFetch("/auth/v1/admin/users", {
          method: "POST",
          body: { email, password, email_confirm: true },
        });
        return NextResponse.json({ user });
      }

      case "deleteUser": {
        if (!uid) {
          return NextResponse.json({ error: "缺少 uid" }, { status: 400 });
        }
        await adminFetch(`/auth/v1/admin/users/${uid}`, { method: "DELETE" });
        return NextResponse.json({ success: true });
      }

      case "dbInsert": {
        if (!table || !data) {
          return NextResponse.json({ error: "缺少 table 或 data" }, { status: 400 });
        }
        const r = await adminFetch(`/rest/v1/${table}`, { method: "POST", body: data });
        return NextResponse.json({ result: Array.isArray(r) ? r[0] : r });
      }

      case "dbUpdate": {
        if (!table || !data || !filter) {
          return NextResponse.json({ error: "缺少 table、data 或 filter" }, { status: 400 });
        }
        const r = await adminFetch(`/rest/v1/${table}?${filter}`, { method: "PATCH", body: data });
        return NextResponse.json({ result: r });
      }

      case "dbGet": {
        if (!table || !filter) {
          return NextResponse.json({ error: "缺少 table 或 filter" }, { status: 400 });
        }
        const arr = await adminFetch(
          `/rest/v1/${table}?${filter}&select=${encodeURIComponent(select || "*")}`
        );
        const row = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
        return NextResponse.json({ result: row });
      }

      case "dbList": {
        if (!table) {
          return NextResponse.json({ error: "缺少 table" }, { status: 400 });
        }
        const arr = await adminFetch(`/rest/v1/${table}?${filter || ""}&select=*&order=created_at.desc`);
        return NextResponse.json({ result: arr });
      }

      default:
        return NextResponse.json({ error: `未知 action: ${action}` }, { status: 400 });
    }
  } catch (e: any) {
    console.error("Stella-admin error:", e);
    return NextResponse.json({ error: e.message || "内部错误" }, { status: 500 });
  }
}
