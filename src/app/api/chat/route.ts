import { NextRequest, NextResponse } from "next/server";
import { STELLA_SYSTEM_PROMPT } from "@/lib/prompts";
import { searchKnowledge } from "@/lib/knowledge-base";
import { classifyCrisis } from "@/lib/crisis";
import { getUserTier, getTierConfig } from "@/lib/quota-config";

export const runtime = "edge";

// 模型配置 — 供应商已切正为 DeepSeek 官方 API
const AI_CONFIG = {
  provider: "deepseek",
  baseURL: "https://api.deepseek.com/v1",
  model: "deepseek-v4-flash",
};

function getApiKey(): string {
  if (AI_CONFIG.provider === "deepseek") {
    return process.env.DEEPSEEK_API_KEY || "";
  }
  if (AI_CONFIG.provider === "siliconflow") {
    return process.env.SILICONFLOW_API_KEY || "";
  }
  return process.env.ANTHROPIC_API_KEY || "";
}

/**
 * E/T 双模式路由：根据用户消息判断模式
 * E 类（情绪/关系）：包含情绪词、关系冲突词 → 先教练后方案
 * T 类（方法/工具）：包含方法请求、工具词 → 直接给方案
 */
function detectMode(userMessage: string): "E" | "T" | "ask" {
  const eKeywords = [
    "情绪", "崩溃", "生气", "愤怒", "内疚", "焦虑", "担心", "无助",
    "吵架", "冲突", "顶嘴", "冷战", "不愿沟通", "不说话",
    "心累", "撑不住", "无力", "失望", "绝望",
    "亲子关系", "夫妻", "分歧", "不理解",
  ];
  const tKeywords = [
    "怎么做", "怎么办", "方法", "步骤", "怎么让", "怎么帮", "怎么教",
    "规则", "计划", "作息", "作业", "手机", "电子产品",
    "工具", "技巧", "话术", "怎么说", "沟通示例",
    "家庭会议", "奖励", "惩罚", "习惯",
  ];

  let eScore = 0, tScore = 0;
  for (const kw of eKeywords) { if (userMessage.includes(kw)) eScore++; }
  for (const kw of tKeywords) { if (userMessage.includes(kw)) tScore++; }

  if (eScore > tScore) return "E";
  if (tScore > eScore) return "T";
  return "ask"; // 不确定，让家长选
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : null;
    const userId = body?.userId || "anonymous";

    if (!messages) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured. Please set ${AI_CONFIG.provider.toUpperCase()}_API_KEY in .env.local` },
        { status: 500 }
      );
    }

    // === G2 配额检查 ===
    const tier = getUserTier(userId);
    const tierConfig = getTierConfig(tier);
    const quotaUsage = body?.quotaUsage || { daily: 0, monthly: 0 };

    // 月上限
    if (tierConfig.monthlyLimit > 0 && quotaUsage.monthly >= tierConfig.monthlyLimit) {
      const msg = tier === "free"
        ? "本月免费咨询次数已用完。了解 Stella 老师完整课程体系，请前往「课程学习」。"
        : "本月咨询次数已达上限。如需扩容，请联系 Stella 老师。";
      return NextResponse.json({ error: msg, quotaExceeded: true, tier }, { status: 429 });
    }
    // 日上限
    if (tierConfig.dailyLimit > 0 && quotaUsage.daily >= tierConfig.dailyLimit) {
      if (tierConfig.hardLimit) {
        return NextResponse.json({
          error: "今日免费咨询次数已用完。明天再来，或了解 Stella 老师完整课程体系。",
          quotaExceeded: true,
          tier,
        }, { status: 429 });
      }
      // 学员档软上限：不断流，但附加温和提示
    }

    // === RAG: 知识库检索 ===
    const latestUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop()?.content || "";

    // === 危机检测（C 部分：高风险词断流 → 旗舰模型研判） ===
    // crisis.ts 已上线，本路由只调其 classifyCrisis，不修改危机逻辑
    const crisisResult = await classifyCrisis(
      latestUserMessage, apiKey, AI_CONFIG.baseURL, AI_CONFIG.model
    );
    if (crisisResult.triggered) {
      return NextResponse.json({
        content: crisisResult.script,
        role: "assistant",
        crisis: {
          triggered: true,
          subject: crisisResult.subject,
          level: crisisResult.level,
          lockPage: crisisResult.lockPage,
        },
      });
    }

    // === E/T 双模式路由 ===
    const detectedMode = detectMode(latestUserMessage);
    let modeInstruction = "";
    if (detectedMode === "E") {
      modeInstruction = "\n\n【本次对话模式：E — 情绪/关系类，先教练后方案。按六步流水线执行，进入方案前先确认家长已准备好接收具体做法。】";
    } else if (detectedMode === "T") {
      modeInstruction = "\n\n【本次对话模式：T — 方法/工具类，直接给方案。用中国菜单法提供 2-4 条路径，不替家长选择。】";
    } else {
      modeInstruction = "\n\n【路由不确定。先让家长选：「你这次更需要先把心里的结理清，还是先拿到一个今天就能试的做法？」不得连续追问以判断路由。】";
    }

    // === 知识库上下文 ===
    let knowledgeContext = "";
    if (latestUserMessage) {
      const relevantKnowledge = searchKnowledge(latestUserMessage);
      if (relevantKnowledge.length > 0) {
        knowledgeContext = `\n\n【相关知识库资料】\n${relevantKnowledge
          .slice(0, 2)
          .map((k) => `---\n${k.title}（${k.category}）：\n${k.content.substring(0, 400)}...`)
          .join("\n")}`;
      }
    }

    // 学员档软上限提示
    let softLimitNote = "";
    if (tier === "student" && tierConfig.dailyLimit > 0 && quotaUsage.daily >= tierConfig.dailyLimit) {
      softLimitNote = "\n\n【温和提示】用户今日已多次咨询，如果适合，可建议将同类问题整理后集中讨论。不要在回答中直接提及「配额」或「次数限制」。";
    }

    const systemPrompt = `${STELLA_SYSTEM_PROMPT}${modeInstruction}${softLimitNote}\n\n${knowledgeContext}`;

    // === AI 调用 ===
    const aiStartTime = Date.now();
    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 1200,
        thinking: { type: "disabled" },
      }),
    });

    const aiLatency = Date.now() - aiStartTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || `API request failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const usage = data.usage || {};

    // === G3 usage 日志元数据（附在响应中，前端写入 usage-log） ===
    const totalLatency = Date.now() - startTime;
    const usageMeta = {
      model: AI_CONFIG.model,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      latencyMs: totalLatency,
      aiLatencyMs: aiLatency,
      mode: detectedMode,
      tier,
      crisisChecked: true,
      crisisTriggered: false,
    };

    if (content) {
      return NextResponse.json({
        content,
        role: "assistant",
        usage: usageMeta,
        quota: {
          tier,
          dailyRemaining: tierConfig.dailyLimit > 0 ? tierConfig.dailyLimit - quotaUsage.daily : -1,
          monthlyRemaining: tierConfig.monthlyLimit > 0 ? tierConfig.monthlyLimit - quotaUsage.monthly : -1,
          softLimit: tier === "student" && !tierConfig.hardLimit && quotaUsage.daily >= tierConfig.dailyLimit,
        },
      });
    }

    return NextResponse.json({
      content: "抱歉，暂时无法回答这个问题。请换个方式再试一次。",
      role: "assistant",
      usage: usageMeta,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
