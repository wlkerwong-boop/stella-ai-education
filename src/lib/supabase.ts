// 服务端 Data API 封装。用户数据请求必须携带当前 access token，让 RLS 生效。

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) throw new Error('Supabase 尚未配置');
  return { url, publishableKey };
}

async function supFetch(
  path: string,
  opts: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
  accessToken?: string
) {
  const { url, publishableKey } = getConfig();
  const response = await fetch(`${url}${path}`, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken || publishableKey}`,
      ...(opts.body ? { Prefer: 'return=representation' } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text.slice(0, 200)}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function dbGet(table: string, filter: string, select = '*', accessToken?: string) {
  const rows = await supFetch(
    `/rest/v1/${table}?${filter}&select=${encodeURIComponent(select)}`,
    {},
    accessToken
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export function dbList(table: string, filter = '', accessToken?: string) {
  return supFetch(
    `/rest/v1/${table}?${filter}&select=*&order=created_at.desc`,
    {},
    accessToken
  );
}

export async function dbInsert(table: string, data: unknown, accessToken?: string) {
  const rows = await supFetch(
    `/rest/v1/${table}`,
    { method: 'POST', body: data },
    accessToken
  );
  return Array.isArray(rows) ? rows[0] : rows;
}

export function dbUpdate(table: string, data: unknown, filter: string, accessToken?: string) {
  return supFetch(
    `/rest/v1/${table}?${filter}`,
    { method: 'PATCH', body: data },
    accessToken
  );
}

export function dbDelete(table: string, filter: string, accessToken?: string) {
  return supFetch(
    `/rest/v1/${table}?${filter}`,
    { method: 'DELETE' },
    accessToken
  );
}

export async function authGetUser(token: string) {
  const { url, publishableKey } = getConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('获取用户失败');
  return response.json();
}
