// Supabase 客户端（基于 fetch，无需额外依赖）
// 使用 Supabase REST API 和 Auth API

function getUrl() {
  return typeof window === "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL || "" : "";
}
function getSvcKey() {
  return typeof window === "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY || "" : "";
}
function getAnon() {
  return typeof window === "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "" : "";
}

async function req(method: string, path: string, body?: any, useSvc = true) {
  const key = useSvc ? getSvcKey() : getAnon();
  const url = `${getUrl()}${path}`;
  const opts: any = {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

// ===== Auth API =====

export async function createUser(email: string, password: string) {
  const data = await req("POST", "/auth/v1/admin/users", { email, password, email_confirm: true });
  return data;
}

export async function deleteUser(userId: string) {
  await req("DELETE", `/auth/v1/admin/users/${userId}`);
}

export async function signIn(email: string, password: string) {
  const data = await req("POST", `/auth/v1/token?grant_type=password`, { email, password }, false);
  return data;
}

export async function getUser(token: string) {
  const url = `${getUrl()}/auth/v1/user`;
  const res = await fetch(url, {
    headers: { apikey: getAnon(), Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

// ===== Database API =====

function qs(params: Record<string, string>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

export async function selectOne(table: string, filters: Record<string, string>, useSvc = true) {
  const path = `/rest/v1/${table}${qs(filters)}`;
  const key = useSvc ? getSvcKey() : getAnon();
  const url = `${getUrl()}${path}`;
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/vnd.pgrst.object+json",
    },
  });
  const text = await res.text();
  if (!res.ok) return null;
  return text ? JSON.parse(text) : null;
}

export async function selectList(table: string, filters: Record<string, string>, useSvc = true) {
  const path = `/rest/v1/${table}${qs(filters)}`;
  const key = useSvc ? getSvcKey() : getAnon();
  const url = `${getUrl()}${path}`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  if (!res.ok) return [];
  return text ? JSON.parse(text) : [];
}

export async function insertOne(table: string, data: any, useSvc = true) {
  const result = await req("POST", `/rest/v1/${table}`, data, useSvc);
  return Array.isArray(result) ? result[0] : result;
}

export async function updateRows(table: string, data: any, filters: Record<string, string>, useSvc = true) {
  return req("PATCH", `/rest/v1/${table}${qs(filters)}`, data, useSvc);
}

export async function deleteRows(table: string, filters: Record<string, string>, useSvc = true) {
  return req("DELETE", `/rest/v1/${table}${qs(filters)}`, undefined, useSvc);
}
