/**
 * Stella G2 配额配置
 *
 * 数值来源：decisions/2026-07-30-stella-G2配额三档拍板-K3.md
 * 铁律：禁止硬编码。所有数值从环境变量读取，默认值按 G2 拍板决策。
 *
 * 环境变量覆盖：
 *   QUOTA_FREE_DAILY      免费档日上限（默认 3）
 *   QUOTA_FREE_MONTHLY    免费档月上限（默认 20）
 *   QUOTA_STUDENT_DAILY   学员档日软上限（默认 30）
 *   QUOTA_STUDENT_MONTHLY 学员档月上限（默认 200）
 *   QUOTA_B_MONTHLY       B端档月上限（默认 5000）
 */

export type UserTier = "free" | "student" | "b_end";

export interface TierConfig {
  dailyLimit: number;
  monthlyLimit: number;
  hardLimit: boolean; // true = 触顶硬断, false = 软上限（温和提示）
}

export const QUOTA_TIERS: Record<UserTier, TierConfig> = {
  free: {
    dailyLimit: parseInt(process.env.QUOTA_FREE_DAILY || "3", 10),
    monthlyLimit: parseInt(process.env.QUOTA_FREE_MONTHLY || "20", 10),
    hardLimit: true,
  },
  student: {
    dailyLimit: parseInt(process.env.QUOTA_STUDENT_DAILY || "30", 10),
    monthlyLimit: parseInt(process.env.QUOTA_STUDENT_MONTHLY || "200", 10),
    hardLimit: false, // 连续触顶先温和提示，不硬断
  },
  b_end: {
    dailyLimit: 0, // B端不设日上限
    monthlyLimit: parseInt(process.env.QUOTA_B_MONTHLY || "5000", 10),
    hardLimit: true,
  },
};

/** 获取用户档位，默认免费档 */
export function getUserTier(userId?: string): UserTier {
  // 未来从 Supabase profiles 或 JWT claims 读取
  // 当前种子期：全部按免费档，除非显式标记
  if (!userId) return "free";

  // 检查 localStorage 中的档位标记（临时方案，未来切 Supabase）
  if (typeof window !== "undefined") {
    try {
      const tier = localStorage.getItem(`stella_tier_${userId}`);
      if (tier === "student" || tier === "b_end") return tier;
    } catch {}
  }

  return "free";
}

/** 获取指定档位的配置 */
export function getTierConfig(tier: UserTier): TierConfig {
  return QUOTA_TIERS[tier];
}
