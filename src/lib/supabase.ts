// Supabase REST API 封装（临时硬编码）
// TODO: 环境变量修好后改为 process.env

const SB_URL = "https://tnmbesyjsftephqmwsmw.supabase.co";
const SB_KEY = "sb_secret_O56pTqkPlgre09xc0JOx2A_oIUfjpX3";
const SB_ANON = "sb_publishable_yBYMK2lVhVeoR4XNHvrzfQ_hVXvUznS";

async function supFetch(path: string, opts: any = {}) {
  const key = opts.anon ? SB_ANON : SB_KEY;
  const url = `${SB_URL}${path}`;
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

// 查单条
export async function dbGet(table: string, filter: string, select = "*") {
  return supFetch(`/rest/v1/${table}?${filter}&select=${encodeURIComponent(select)}`, {
    headers: { Accept: "application/vnd.pgrst.object+json" },
  });
}

// 查多条
export async function dbList(table: string, filter = "", select = "*") {
  return supFetch(`/rest/v1/${table}?${filter}&select=${encodeURIComponent(select)}&order=created_at.desc`);
}

// 插入
export async function dbInsert(table: string, data: any) {
  const r = await supFetch(`/rest/v1/${table}`, { method: "POST", body: data });
  return Array.isArray(r) ? r[0] : r;
}

// 更新
export async function dbUpdate(table: string, data: any, filter: string) {
  return supFetch(`/rest/v1/${table}?${filter}`, { method: "PATCH", body: data });
}

// 删除
export async function dbDelete(table: string, filter: string) {
  return supFetch(`/rest/v1/${table}?${filter}`, { method: "DELETE" });
}

// Auth: 创建用户
export async function authCreateUser(email: string, password: string) {
  return supFetch("/auth/v1/admin/users", { method: "POST", body: { email, password, email_confirm: true } });
}

// Auth: 删除用户
export async function authDeleteUser(uid: string) {
  return supFetch(`/auth/v1/admin/users/${uid}`, { method: "DELETE" });
}

// Auth: 密码登录
export async function authLogin(email: string, password: string) {
  return supFetch(`/auth/v1/token?grant_type=password`, { method: "POST", body: { email, password }, anon: true });
}

// Auth: 获取用户
export async function authGetUser(token: string) {
  const res = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("获取用户失败");
  return res.json();
}
