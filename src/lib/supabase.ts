// Supabase REST API 封装
// 优先用环境变量

function getUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL || ""; }
function getKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || ""; }
function getAnon() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; }

async function supFetch(path: string, opts: any = {}) {
  const key = opts.anon ? getAnon() : getKey();
  const baseUrl = getUrl();
  if (!baseUrl || !key) throw new Error("Supabase未配置");
  const res = await fetch(`${baseUrl}${path}`, {
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

// 查单条 - 用数组+取第0个，避免Accept object的问题
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

export async function authCreateUser(email: string, password: string) {
  return supFetch("/auth/v1/admin/users", { method: "POST", body: { email, password, email_confirm: true } });
}

export async function authDeleteUser(uid: string) {
  return supFetch(`/auth/v1/admin/users/${uid}`, { method: "DELETE" });
}

export async function authLogin(email: string, password: string) {
  return supFetch(`/auth/v1/token?grant_type=password`, { method: "POST", body: { email, password }, anon: true });
}

export async function authGetUser(token: string) {
  const res = await fetch(`${getUrl()}/auth/v1/user`, {
    headers: { apikey: getAnon(), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("获取用户失败");
  return res.json();
}
