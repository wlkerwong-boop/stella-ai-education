import { NextRequest, NextResponse } from "next/server";
import { STELLA_SYSTEM_PROMPT } from "@/lib/prompts";
import { searchKnowledge } from "@/lib/knowledge-base";
import { classifyCrisis } from "@/lib/crisis";

export const runtime = "edge";

// 支持多个AI提供商，方便切换
// 默认使用硅基流动（SiliconFlow）- 新用户有免费额度
const AI_CONFIG = {
  // 选项1：硅基流动 (推荐，新用户送¥14，兼容OpenAI格式)
  // 注册：https://cloud.siliconflow.cn/
  // provider: "siliconflow",
  // baseURL: "https://api.siliconflow.cn/v1",
  // model: "deepseek-ai/DeepSeek-V3",

  // 选项2：DeepSeek V4 Flash（deepseek-chat 已于 2026-07-24 停用）
  provider: "deepseek",
  baseURL: "https://api.deepseek.com/v1",
  model: "deepseek-v4-flash",

  // 选项3：Anthropic Claude (付费，效果最好)
  // provider: "anthropic",
  // baseURL: "https://api.anthropic.com/v1",
  // model: "claude-sonnet-4-6-20251001",
};

// 获取API Key
function getApiKey(): string {
  // 硅基流动
  if (AI_CONFIG.provider === "siliconflow") {
    return process.env.SILICONFLOW_API_KEY || "";
  }
  // DeepSeek
  if (AI_CONFIG.provider === "deepseek") {
    return process.env.DEEPSEEK_API_KEY || "";
  }
  // Anthropic
  return process.env.ANTHROPIC_API_KEY || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : null;

    if (!messages) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: `API key not configured. Please set ${AI_CONFIG.provider.toUpperCase()}_API_KEY in .env.local`,
        },
        { status: 500 }
      );
    }

    // RAG: get latest user message and search knowledge base
    const latestUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop()?.content;

    // === 危机检测（C 部分：高风险词断流 → 旗舰模型研判） ===
    if (latestUserMessage) {
      const crisisResult = await classifyCrisis(
        latestUserMessage,
        apiKey,
        AI_CONFIG.baseURL,
        AI_CONFIG.model
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
    }

    let knowledgeContext = "";
    if (latestUserMessage) {
      const relevantKnowledge = searchKnowledge(latestUserMessage);
      if (relevantKnowledge.length > 0) {
        knowledgeContext = `\n\n【相关知识库资料】\n${relevantKnowledge
          .slice(0, 2)
          .map(
            (k) =>
              `---\n${k.title}（${k.category}）：\n${k.content.substring(0, 400)}...`
          )
          .join("\n")}`;
      }
    }

    const systemPrompt = `${STELLA_SYSTEM_PROMPT}\n\n${knowledgeContext}`;

    // 调用AI API (OpenAI兼容格式)
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AI API error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData.error?.message ||
            `API request failed: ${response.status}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      return NextResponse.json({
        content,
        role: "assistant",
      });
    }

    // 友好兜底：模型未返回有效内容（如拒答、超限等）
    return NextResponse.json({
      content: "抱歉，暂时无法回答这个问题。请换个方式再试一次。",
      role: "assistant",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
