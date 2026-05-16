// 学员工具台数据存储
// 基于localStorage，前缀区分数据类

// ====== 类型定义 ======

export type ToolType =
  | "orid"
  | "emotion"
  | "iceberg"
  | "action-card"
  | "character";

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
  stellaComment?: string;   // Stella老师的点评
  stellaCommentAt?: number; // 点评时间
  createdAt: number;
  updatedAt: number;
}

export interface StudentUser {
  userId: string;
  inviteCode: string;
  nickname: string;
  createdAt: number;
}

// ====== 存储Key常量 ======

const STUDENT_KEY = "stella_student_user";
const TOOL_RECORDS_KEY = "stella_tool_records";
const INVITE_CODES_KEY = "stella_invite_codes";

// ====== 预置邀请码 ======
// Stella老师可在此追加新邀请码
const DEFAULT_INVITE_CODES: Record<string, boolean> = {
  "STELLA-001": false,
  "STELLA-002": false,
  "STELLA-003": false,
  "STELLA-004": false,
  "STELLA-005": false,
  "STELLA-006": false,
  "STELLA-007": false,
  "STELLA-008": false,
  "STELLA-009": false,
  "STELLA-010": false,
  "STELLA-011": false,
  "STELLA-012": false,
  "STELLA-013": false,
  "STELLA-014": false,
  "STELLA-015": false,
  "STELLA-016": false,
  "STELLA-017": false,
  "STELLA-018": false,
  "STELLA-019": false,
  "STELLA-020": false,
  "STELLA-021": false,
  "STELLA-022": false,
  "STELLA-023": false,
  "STELLA-024": false,
  "STELLA-025": false,
  "STELLA-026": false,
  "STELLA-027": false,
  "STELLA-028": false,
  "STELLA-029": false,
  "STELLA-030": false,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ====== 邀请码管理 ======

function getInviteCodes(): Record<string, boolean> {
  if (typeof window === "undefined") return DEFAULT_INVITE_CODES;
  try {
    const data = localStorage.getItem(INVITE_CODES_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  // 首次使用：将默认码写入localStorage
  localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(DEFAULT_INVITE_CODES));
  return { ...DEFAULT_INVITE_CODES };
}

function saveInviteCodes(codes: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(codes));
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

export function registerStudent(code: string, nickname: string): StudentUser | null {
  const result = verifyInviteCode(code);
  if (!result.valid) return null;

  const user: StudentUser = {
    userId: generateId(),
    inviteCode: code.trim().toUpperCase(),
    nickname: nickname.trim(),
    createdAt: Date.now(),
  };

  // 标记邀请码已使用
  const codes = getInviteCodes();
  codes[user.inviteCode] = true;
  saveInviteCodes(codes);

  // 保存用户身份
  if (typeof window !== "undefined") {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(user));
  }

  return user;
}

export function getCurrentStudent(): StudentUser | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STUDENT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logoutStudent() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STUDENT_KEY);
  }
}

// ====== 工具记录管理 ======

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

// 获取对Stella老师可见的记录
export function getStellaVisibleRecords(): ToolRecord[] {
  return getAllToolRecords().filter((r) => r.visibility === "shared-with-stella");
}

// ====== 统计函数（用于成长图谱） ======

export function getToolStats(userId: string) {
  const records = getToolRecordsByUser(userId);
  const byType: Record<string, number> = {};
  const byVisibility: Record<string, number> = { private: 0, "shared-with-stella": 0, public: 0 };

  for (const r of records) {
    byType[r.toolType] = (byType[r.toolType] || 0) + 1;
    byVisibility[r.visibility] = (byVisibility[r.visibility] || 0) + 1;
  }

  return {
    totalRecords: records.length,
    byType,
    byVisibility,
    firstRecordDate: records.length > 0 ? records[records.length - 1].createdAt : null,
    latestRecordDate: records.length > 0 ? records[0].createdAt : null,
  };
}

// 获取情绪温度计数据（用于图表）
export function getEmotionHistory(userId: string, days: number = 30): { date: string; score: number; emotion: string }[] {
  const records = getToolRecordsByUser(userId)
    .filter((r) => r.toolType === "emotion")
    .slice(0, days)
    .map((r) => ({
      date: r.content.date || new Date(r.createdAt).toISOString().slice(0, 10),
      score: r.content.score || 5,
      emotion: r.content.emotion || "",
    }))
    .reverse();
  return records;
}

// 获取品格自测历史
export function getCharacterHistory(userId: string): { date: string; scores: Record<string, number> }[] {
  return getToolRecordsByUser(userId)
    .filter((r) => r.toolType === "character")
    .map((r) => ({
      date: r.content.date || new Date(r.createdAt).toISOString().slice(0, 10),
      scores: r.content.scores || {},
    }))
    .reverse();
}

// ====== API辅助函数 ======

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
