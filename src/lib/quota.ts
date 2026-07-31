/**
 * Stella G2 配额检查逻辑
 *
 * 免费档：日/月硬上限，触顶返回 429 + 引导了解课程
 * 学员档：日软上限（连续触顶温和提示），月硬上限
 * B端档：月硬上限
 *
 * 存储：localStorage（key: stella_quota_{userId}），未来切 Supabase
 */

import { getUserTier, getTierConfig, type UserTier } from "./quota-config";

interface QuotaUsage {
  daily: Record<string, number>;   // "2026-07-31" → count
  monthly: Record<string, number>; // "2026-07" → count
  consecutiveDailyHits: number;    // 连续触日上限天数（学员档用）
  lastHitDate: string | null;
}

export interface QuotaResult {
  allowed: boolean;
  reason?: string;
  remaining?: { daily: number; monthly: number };
  hardLimit: boolean;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

function readUsage(userId: string): QuotaUsage {
  if (typeof window === "undefined") {
    return { daily: {}, monthly: {}, consecutiveDailyHits: 0, lastHitDate: null };
  }
  try {
    const raw = localStorage.getItem(`stella_quota_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { daily: {}, monthly: {}, consecutiveDailyHits: 0, lastHitDate: null };
}

function writeUsage(userId: string, usage: QuotaUsage) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`stella_quota_${userId}`, JSON.stringify(usage));
  } catch {}
}

function incrementUsage(userId: string): QuotaUsage {
  const usage = readUsage(userId);
  const dk = todayKey();
  const mk = monthKey();

  usage.daily[dk] = (usage.daily[dk] || 0) + 1;
  usage.monthly[mk] = (usage.monthly[mk] || 0) + 1;

  // 跟踪连续触日上限
  if (usage.lastHitDate === dk) {
    usage.consecutiveDailyHits++;
  } else {
    // 检查昨天是否也触顶
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (usage.lastHitDate === yesterday) {
      usage.consecutiveDailyHits++;
    } else {
      usage.consecutiveDailyHits = 1;
    }
  }
  usage.lastHitDate = dk;

  writeUsage(userId, usage);
  return usage;
}

/**
 * 检查用户配额
 * @returns QuotaResult — allowed=false 时应拒绝请求
 */
export function checkQuota(userId?: string): QuotaResult {
  const id = userId || "anonymous";
  const tier = getUserTier(userId);
  const config = getTierConfig(tier);
  const usage = readUsage(id);

  const dk = todayKey();
  const mk = monthKey();
  const dailyCount = usage.daily[dk] || 0;
  const monthlyCount = usage.monthly[mk] || 0;

  // 月上限检查
  if (config.monthlyLimit > 0 && monthlyCount >= config.monthlyLimit) {
    const msg = tier === "free"
      ? "本月免费咨询次数已用完。了解 Stella 老师完整课程体系，请点击「课程学习」。"
      : "本月咨询次数已达上限。如需扩容，请联系 Stella 老师。";
    return {
      allowed: false,
      reason: msg,
      remaining: { daily: 0, monthly: 0 },
      hardLimit: config.hardLimit,
    };
  }

  // 日上限检查
  if (config.dailyLimit > 0 && dailyCount >= config.dailyLimit) {
    if (config.hardLimit) {
      // 免费档：硬断
      return {
        allowed: false,
        reason: "今日免费咨询次数已用完。明天再来，或了解 Stella 老师完整课程体系。",
        remaining: { daily: 0, monthly: config.monthlyLimit - monthlyCount },
        hardLimit: true,
      };
    } else {
      // 学员档：软上限 — 连续触顶才提示
      if (usage.consecutiveDailyHits >= 2) {
        return {
          allowed: true, // 不断流，但在响应中附加提示
          reason: "你已经连续多天高频使用，建议将高频问题整理后集中咨询，效果更好。",
          remaining: { daily: 0, monthly: config.monthlyLimit - monthlyCount },
          hardLimit: false,
        };
      }
      // 首次触日上限，允许但记录
      return {
        allowed: true,
        remaining: { daily: 0, monthly: config.monthlyLimit - monthlyCount },
        hardLimit: false,
      };
    }
  }

  return {
    allowed: true,
    remaining: {
      daily: config.dailyLimit > 0 ? config.dailyLimit - dailyCount : -1,
      monthly: config.monthlyLimit > 0 ? config.monthlyLimit - monthlyCount : -1,
    },
    hardLimit: config.hardLimit,
  };
}

/**
 * 记录一次成功的 API 调用（增加计数）
 */
export function recordQuotaUsage(userId?: string): QuotaUsage {
  return incrementUsage(userId || "anonymous");
}

/**
 * 获取用户当前用量摘要（供前端展示）
 */
export function getQuotaSummary(userId?: string) {
  const id = userId || "anonymous";
  const tier = getUserTier(userId);
  const config = getTierConfig(tier);
  const usage = readUsage(id);

  return {
    tier,
    dailyUsed: usage.daily[todayKey()] || 0,
    dailyLimit: config.dailyLimit,
    monthlyUsed: usage.monthly[monthKey()] || 0,
    monthlyLimit: config.monthlyLimit,
    hardLimit: config.hardLimit,
  };
}
