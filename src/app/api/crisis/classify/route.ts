import { NextRequest, NextResponse } from "next/server";
import { classifyCrisis } from "@/lib/crisis";

export const runtime = "edge";

const AI_CONFIG = {
  provider: "deepseek",
  baseURL: "https://api.deepseek.com/v1",
  model: "deepseek-v4-flash",
};

function getApiKey(): string {
  if (AI_CONFIG.provider === "deepseek") {
    return process.env.DEEPSEEK_API_KEY || "";
  }
  return "";
}

/**
 * 临时频率保护：同一 IP 每分钟最多 10 次
 * 内存计数（Edge 冷启动后重置），正式方案二期切分布式限流
 * 标注：临时保护
 */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ||
             req.headers.get("x-real-ip") ||
             "unknown";

  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429 }
    );
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ triggered: false });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      // 无 API key 时降级：只做关键词检测，不调模型
      const { detectCrisisKeywords, CRISIS_SCRIPTS } = await import("@/lib/crisis");
      if (detectCrisisKeywords(text)) {
        return NextResponse.json({
          triggered: true,
          subject: "child",
          level: "R2",
          script: CRISIS_SCRIPTS.child.R2,
          lockPage: true,
        });
      }
      return NextResponse.json({ triggered: false });
    }

    const result = await classifyCrisis(
      text, apiKey, AI_CONFIG.baseURL, AI_CONFIG.model
    );

    if (result.triggered) {
      return NextResponse.json({
        triggered: true,
        subject: result.subject,
        level: result.level,
        script: result.script,
        lockPage: result.lockPage,
      });
    }

    return NextResponse.json({ triggered: false });
  } catch {
    // 失败偏安全：返回 R2
    const { CRISIS_SCRIPTS } = await import("@/lib/crisis");
    return NextResponse.json({
      triggered: true,
      subject: "child",
      level: "R2",
      script: CRISIS_SCRIPTS.child.R2,
      lockPage: true,
    });
  }
}
