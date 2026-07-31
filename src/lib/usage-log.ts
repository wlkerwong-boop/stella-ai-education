/**
 * Stella G3 usage 精确日志
 *
 * 记录每次 /chat API 调用的模型、token 用量、用户档位、耗时、E/T 模式、危机检查状态。
 * 存储：localStorage（key: stella_usage_log），用于成本复核。未来切 Supabase。
 */

export interface UsageLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  tier: "free" | "student" | "b_end";
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  mode: "E" | "T" | "unknown";
  crisisChecked: boolean;
  crisisTriggered: boolean;
  userMessageLength: number;
  quotaRemainingDaily: number;
  quotaRemainingMonthly: number;
  success: boolean;
  errorMessage?: string;
}

const STORAGE_KEY = "stella_usage_log";
const MAX_ENTRIES = 1000;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): UsageLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: UsageLogEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {}
}

export function logUsage(entry: Omit<UsageLogEntry, "id">): UsageLogEntry {
  const full: UsageLogEntry = { ...entry, id: generateId() };
  const all = readAll();
  all.push(full);
  writeAll(all);
  return full;
}

export function getUsageLogs(limit = 50): UsageLogEntry[] {
  return readAll().slice(-limit).reverse();
}

export function getUsageStats() {
  const all = readAll();
  const byTier: Record<string, { count: number; totalTokens: number; totalCost: number }> = {};
  let totalCalls = 0;
  let totalTokens = 0;
  let totalCost = 0;

  for (const entry of all) {
    if (!entry.success) continue;
    totalCalls++;
    totalTokens += entry.totalTokens;

    // 成本估算: 输入 ¥1/M, 输出 ¥2/M tokens
    const cost = (entry.promptTokens / 1_000_000) * 1 + (entry.completionTokens / 1_000_000) * 2;
    totalCost += cost;

    if (!byTier[entry.tier]) {
      byTier[entry.tier] = { count: 0, totalTokens: 0, totalCost: 0 };
    }
    byTier[entry.tier].count++;
    byTier[entry.tier].totalTokens += entry.totalTokens;
    byTier[entry.tier].totalCost += cost;
  }

  return { totalCalls, totalTokens, totalCost, byTier };
}
