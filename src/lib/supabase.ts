// Supabase REST API 封装
// 优先用环境变量，本地开发用 .env.local

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function getKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function getAnon() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

async function supFetch(path: string, opts: any = {}) {
  const key = opts.anon ? getAnon() : getKey();
  const baseUrl = getUrl();
  if (!baseUrl || !key) {
    throw new Error(`Supabase未配置: URL=${!!baseUrl} KEY=${!!key}`);
  }
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...(opts.headers || {}),
  };
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function dbGet(table: string, filter: string, select = "*") {
  return supFetch(`/rest/v1/${table}?${filter}&select=${encodeURIComponent(select)}`, {
    headers: { Accept: "application/vnd.pgrst.object+json" },
  });
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
  const baseUrl = getUrl();
  const anon = getAnon();
  const res = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("获取用户失败");
  return res.json();
}
