import { NextRequest, NextResponse } from "next/server";
import { STELLA_SYSTEM_PROMPT } from "@/lib/prompts";
import { searchKnowledge } from "@/lib/knowledge-base";

export const runtime = "edge";

// 支持多个AI提供商，方便切换
// 默认使用硅基流动（SiliconFlow）- 新用户有免费额度
const AI_CONFIG = {
  // 选项1：硅基流动 (推荐，新用户送¥14，兼容OpenAI格式)
  // 注册：https://cloud.siliconflow.cn/
  provider: "siliconflow",
  baseURL: "https://api.siliconflow.cn/v1",
  model: "deepseek-ai/DeepSeek-V3", // 或 "Qwen/Qwen2.5-72B-Instruct"

  // 选项2：DeepSeek (也有免费额度)
  // provider: "deepseek",
  // baseURL: "https://api.deepseek.com/v1",
  // model: "deepseek-chat",

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
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
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

    let knowledgeContext = "";
    if (latestUserMessage) {
      const relevantKnowledge = searchKnowledge(latestUserMessage);
      if (relevantKnowledge.length > 0) {
        knowledgeContext = `\n\n【相关知识库资料】\n${relevantKnowledge
          .slice(0, 3)
          .map(
            (k) =>
              `---\n${k.title}（${k.category}）：\n${k.content.substring(0, 800)}...`
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
        max_tokens: 2000,
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

    return NextResponse.json(
      { error: "Unexpected response format" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
