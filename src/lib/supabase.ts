// Supabase 客户端（基于 fetch，无需额外依赖）
// 使用 Supabase REST API 和 Auth API

function getBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  }
  return "";
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function getAnonKey() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  }
  return "";
}

// ===== Auth API（服务端用 service_role key） =====

export async function createUser(email: string, password: string) {
  const res = await fetch(`${getBaseUrl()}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: getServiceKey(),
      Authorization: `Bearer ${getServiceKey()}`,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error || "创建用户失败");
  return data;
}

export async function deleteUser(userId: string) {
  await fetch(`${getBaseUrl()}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      apikey: getServiceKey(),
      Authorization: `Bearer ${getServiceKey()}`,
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  const res = await fetch(`${getBaseUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: getAnonKey(),
      Authorization: `Bearer ${getAnonKey()}`,
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "登录失败");
  return data;
}

export async function getUser(accessToken: string) {
  const res = await fetch(`${getBaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: getAnonKey(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("获取用户失败");
  return data;
}

// ===== Database API（REST） =====

async function dbFetch(
  path: string,
  options: { method?: string; body?: any; headers?: Record<string, string>; useService?: boolean } = {}
) {
  const key = options.useService ? getServiceKey() : getAnonKey();
  const res = await fetch(`${getBaseUrl()}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    const err = { status: res.status, body: text };
    throw err;
  }
  // For single row requests with non-array returns
  if (options.headers?.["Accept"] === "application/vnd.pgrst.object+json") {
    return res.json();
  }
  const text = await res.text();
  if (!text) return [];
  return JSON.parse(text);
}

export async function select(table: string, query: Record<string, string> = {}, useService = false) {
  const params = new URLSearchParams(query);
  // Build select query
  const qs = params.toString();
  return dbFetch(`${table}${qs ? `?${qs}` : ""}`, { useService });
}

export async function selectSingle(table: string, query: Record<string, string> = {}, useService = false) {
  const params = new URLSearchParams(query);
  const qs = params.toString();
  return dbFetch(`${table}${qs ? `?${qs}` : ""}`, {
    useService,
    headers: { Accept: "application/vnd.pgrst.object+json" },
  });
}

export async function insert(table: string, data: any, useService = false) {
  return dbFetch(table, { method: "POST", body: data, useService });
}

export async function update(table: string, data: any, query: Record<string, string> = {}, useService = false) {
  const params = new URLSearchParams(query);
  const qs = params.toString();
  return dbFetch(`${table}${qs ? `?${qs}` : ""}`, { method: "PATCH", body: data, useService });
}

export async function remove(table: string, query: Record<string, string> = {}, useService = false) {
  const params = new URLSearchParams(query);
  const qs = params.toString();
  return dbFetch(`${table}${qs ? `?${qs}` : ""}`, { method: "DELETE", useService });
}
