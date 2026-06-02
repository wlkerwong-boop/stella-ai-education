// 学员工具台数据存储
// 支持：Supabase API（优先）+ localStorage（向后兼容）

export type ToolType = "orid" | "emotion" | "iceberg" | "action-card" | "character";
export type Visibility = "private" | "shared-with-stella" | "public";

export interface ToolRecord {
  id: string;
  userId: string;
  nickname: string;
  toolType: ToolType;
  title: string;
  content: Record<string, any>;
  visibility: Visibility;
  tags: string[];
  stellaComment?: string;
  stellaCommentAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface StudentUser {
  userId: string;
  inviteCode: string;
  nickname: string;
  createdAt: number;
}

// ====== 认证相关 ======

export function getSession(): { access_token: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("stella_session");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function getCurrentStudent(): StudentUser | null {
  if (typeof window === "undefined") return null;
  // 优先用 Supabase session
  const session = getSession();
  if (session) {
    try {
      const userData = localStorage.getItem("stella_user");
      if (userData) {
        const u = JSON.parse(userData);
        return {
          userId: u.id || u.userId,
          inviteCode: u.invite_code || "",
          nickname: u.nickname,
          createdAt: Date.now(),
        };
      }
    } catch {}
  }
  // 回退到旧的 localStorage 方式
  try {
    const data = localStorage.getItem("stella_student_user");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logoutStudent() {
  localStorage.removeItem("stella_session");
  localStorage.removeItem("stella_user");
  localStorage.removeItem("stella_student_user");
  localStorage.removeItem("stella_tool_records");
}

// ====== API 调用（带 Supabase session） ======

async function apiFetch(url: string, options: RequestInit = {}) {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "请求失败" }));
    throw new Error(err.error || "请求失败");
  }
  return res.json();
}

// ====== 工具记录管理 ======

export async function saveToolRecordAPI(record: Omit<ToolRecord, "id" | "createdAt" | "updatedAt">): Promise<ToolRecord> {
  const data = await apiFetch("/api/tools", {
    method: "POST",
    body: JSON.stringify({
      toolType: record.toolType,
      title: record.title,
      content: record.content,
      visibility: record.visibility,
      tags: record.tags,
    }),
  });
  return data.record;
}

export async function getAllToolRecordsAPI(): Promise<ToolRecord[]> {
  const data = await apiFetch("/api/tools");
  return data.records;
}

export async function updateToolRecordAPI(id: string, updates: Partial<ToolRecord>): Promise<ToolRecord> {
  const data = await apiFetch(`/api/tools/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return data.record;
}

export async function deleteToolRecordAPI(id: string): Promise<void> {
  await apiFetch(`/api/tools/${id}`, { method: "DELETE" });
}

// ====== 旧的 localStorage 兼容 ======

const STUDENT_KEY = "stella_student_user";
const TOOL_RECORDS_KEY = "stella_tool_records";
const INVITE_CODES_KEY = "stella_invite_codes";

const DEFAULT_INVITE_CODES: Record<string, boolean> = {};
for (let i = 1; i <= 30; i++) {
  DEFAULT_INVITE_CODES[`STELLA-${String(i).padStart(3, "0")}`] = false;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getInviteCodes(): Record<string, boolean> {
  if (typeof window === "undefined") return DEFAULT_INVITE_CODES;
  try {
    const data = localStorage.getItem(INVITE_CODES_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(DEFAULT_INVITE_CODES));
  return { ...DEFAULT_INVITE_CODES };
}

function saveInviteCodes(codes: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(codes));
}

export function registerStudent(code: string, nickname: string): StudentUser | null {
  const valid = verifyInviteCode(code);
  if (!valid.valid) return null;

  const user: StudentUser = {
    userId: generateId(),
    inviteCode: code.trim().toUpperCase(),
    nickname: nickname.trim(),
    createdAt: Date.now(),
  };

  const codes = getInviteCodes();
  codes[user.inviteCode] = true;
  saveInviteCodes(codes);

  if (typeof window !== "undefined") {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(user));
  }
  return user;
}

export function verifyInviteCode(code: string): { valid: boolean; message: string } {
  const codes = getInviteCodes();
  const trimmed = code.trim().toUpperCase();
  if (codes[trimmed] === undefined) {
    return { valid: false, message: "邀请码不存在，请确认后重试" };
  }
  if (codes[trimmed] === true) {
    return { valid: false, message: "该邀请码已被使用" };
  }
  return { valid: true, message: "邀请码验证通过" };
}

export function saveToolRecord(record: Omit<ToolRecord, "id" | "createdAt" | "updatedAt">): ToolRecord {
  const newRecord: ToolRecord = {
    ...record,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = getAllToolRecords();
  all.unshift(newRecord);
  if (typeof window !== "undefined") {
    localStorage.setItem(TOOL_RECORDS_KEY, JSON.stringify(all.slice(0, 500)));
  }
  return newRecord;
}

export function getAllToolRecords(): ToolRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(TOOL_RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getToolRecordsByUser(userId: string): ToolRecord[] {
  return getAllToolRecords().filter((r) => r.userId === userId);
}

export function getToolRecordById(id: string): ToolRecord | undefined {
  return getAllToolRecords().find((r) => r.id === id);
}

export function updateToolRecord(id: string, updates: Partial<ToolRecord>): ToolRecord | null {
  const all = getAllToolRecords();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates, updatedAt: Date.now() };
  if (typeof window !== "undefined") {
    localStorage.setItem(TOOL_RECORDS_KEY, JSON.stringify(all));
  }
  return all[idx];
}

export function deleteToolRecord(id: string): boolean {
  const all = getAllToolRecords().filter((r) => r.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(TOOL_RECORDS_KEY, JSON.stringify(all));
  }
  return true;
}

export function getStellaVisibleRecords(): ToolRecord[] {
  return getAllToolRecords().filter((r) => r.visibility === "shared-with-stella");
}

export async function apiVerifyInviteCode(code: string): Promise<{ valid: boolean; message: string }> {
  try {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return await res.json();
  } catch {
    return { valid: false, message: "网络错误，请稍后重试" };
  }
}
