// Supabase REST API 封装
// anon key 可公开，service_role 操作走 /api/stella-admin

const SB_URL = "https://tnmbesyjsftephqmwsmw.supabase.co";
const SB_ANON = "sb_publishable_yBYMK2lVhVeoR4XNHvrzfQ_hVXvUznS";

async function supFetch(path: string, opts: any = {}) {
  const key = SB_ANON;
  const res = await fetch(`${SB_URL}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`,
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`${res.status}: ${t.slice(0,200)}`); }
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export async function dbGet(table: string, filter: string, select = "*") {
  const arr = await supFetch(`/rest/v1/${table}?${filter}&select=${encodeURIComponent(select)}`);
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
}

export async function dbList(table: string, filter = "") {
  return supFetch(`/rest/v1/${table}?${filter}&select=*&order=created_at.desc`);
}

export async function dbInsert(table: string, data: any) {
  const r = await supFetch(`/rest/v1/${table}`, { method: "POST", body: data });
  return Array.isArray(r) ? r[0] : r;
}

export async function dbUpdate(table: string, data: any, filter: string) {
  return supFetch(`/rest/v1/${table}?${filter}`, { method: "PATCH", body: data });
}

export async function dbDelete(table: string, filter: string) {
  return supFetch(`/rest/v1/${table}?${filter}`, { method: "DELETE" });
}

export async function authLogin(email: string, password: string) {
  return supFetch(`/auth/v1/token?grant_type=password`, { method: "POST", body: { email, password } });
}

export async function authGetUser(token: string) {
  const res = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("获取用户失败");
  return res.json();
}
