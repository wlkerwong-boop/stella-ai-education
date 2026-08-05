/**
 * Stella 工具使用记录存储层
 *
 * 双通道：POST /api/tools/usage（Supabase tool_usage_records）+ localStorage fallback
 * 与旧 tools-storage.ts 的 tool_records 表隔离，两套数据各自独立。
 *
 * 表结构对齐 materials/2026-07-30-stella工具规格卡与候选清单-Codex.md 2.1 节
 */

export type UsageStatus = "draft" | "completed" | "withdrawn";
export type Visibility = "private" | "shared-with-stella" | "public";

export interface ToolUsageRecord {
  id: string;
  tool_definition_id: string;
  tool_version: string;
  user_id: string;
  child_stage: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  orid_summary: Record<string, string>;
  growth_event_id: string | null;
  visibility: Visibility;
  status: UsageStatus;
  created_at: number;
  updated_at: number;
}

const STORAGE_KEY = "stella_tool_usage_records";

// ====== 工具函数 ======

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ====== localStorage 操作 ======

function readAll(): ToolUsageRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeAll(records: ToolUsageRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 500)));
  } catch { /* quota exceeded, silently drop oldest */ }
}

// ====== 公开 API ======

export function saveToolUsage(
  record: Omit<ToolUsageRecord, "id" | "created_at" | "updated_at">
): ToolUsageRecord {
  const now = Date.now();
  const newRecord: ToolUsageRecord = {
    ...record,
    id: generateId(),
    created_at: now,
    updated_at: now,
  };
  const all = readAll();
  all.unshift(newRecord);
  writeAll(all);

  // 异步尝试写入 API（fire-and-forget，不阻塞）
  saveToolUsageAPI(newRecord).catch(() => {
    // Supabase 表未就位，静默降级
  });

  return newRecord;
}

export function getToolUsageByUser(userId: string): ToolUsageRecord[] {
  return readAll().filter(r => r.user_id === userId);
}

export function getToolUsageById(id: string): ToolUsageRecord | undefined {
  return readAll().find(r => r.id === id);
}

export function updateToolUsage(
  id: string,
  updates: Partial<ToolUsageRecord>
): ToolUsageRecord | null {
  const all = readAll();
  const idx = all.findIndex(r => r.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates, updated_at: Date.now() };
  writeAll(all);
  return all[idx];
}

export function withdrawToolUsage(id: string): boolean {
  const all = readAll();
  const idx = all.findIndex(r => r.id === id);
  if (idx < 0) return false;
  all[idx] = {
    ...all[idx],
    status: "withdrawn",
    updated_at: Date.now(),
  };
  writeAll(all);

  // 异步撤销 API
  withdrawToolUsageAPI(id).catch(() => {});

  return true;
}

export function getToolUsageStats(userId: string) {
  const records = getToolUsageByUser(userId);
  const active = records.filter(r => r.status !== "withdrawn");
  const byTool: Record<string, number> = {};
  for (const r of active) {
    byTool[r.tool_definition_id] = (byTool[r.tool_definition_id] || 0) + 1;
  }
  return {
    totalRecords: active.length,
    byTool,
    firstRecordDate: active.length > 0 ? active[active.length - 1].created_at : null,
    latestRecordDate: active.length > 0 ? active[0].created_at : null,
  };
}

// ====== API 调用（Supabase 就绪后优先） ======

async function apiFetch(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    }
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "请求失败" }));
    throw new Error(err.error || `请求失败 (${res.status})`);
  }
  return res.json();
}

export async function saveToolUsageAPI(
  record: ToolUsageRecord
): Promise<ToolUsageRecord> {
  const data = await apiFetch("/api/tools/usage", {
    method: "POST",
    body: JSON.stringify(record),
  });
  return data.record;
}

export async function getToolUsageAPI(): Promise<ToolUsageRecord[]> {
  const data = await apiFetch("/api/tools/usage");
  return data.records;
}

export async function withdrawToolUsageAPI(id: string): Promise<void> {
  await apiFetch(`/api/tools/usage/${id}`, { method: "DELETE" });
}
import { createClient } from '@/lib/supabase/client';
