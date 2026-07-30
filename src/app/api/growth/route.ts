import { NextRequest, NextResponse } from "next/server";
import { MIND_EVOLUTION_PROMPT } from "@/lib/prompts";

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

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "对话历史不能为空" },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // 格式化对话历史用于分析
    const conversationHistory = messages
      .map(
        (m: { role: string; content: string; timestamp?: number }) =>
          `${m.role === "user" ? "家长" : "Stella老师"}：${m.content}`
      )
      .join("\n\n");

    const analysisPrompt = `${MIND_EVOLUTION_PROMPT}

【家长与AI的问答历史】
${conversationHistory.slice(0, 4000)}

请基于以上问答历史，生成一份温暖、具体、有洞察力的成长分析报告。用Markdown格式输出，包含以下部分：

## 1. 成长概览
用1-2段话总结这位家长的整体成长轨迹。

## 2. 关注焦点演变
描述家长关注点的变化：从什么开始，逐步深入到哪些层面。

## 3. 认知模式转变
- 是否从线性思维向系统思维转变？举例说明
- 是否从问题导向向成长导向转变？

## 4. 情绪与行动
- 情绪状态的变化趋势
- 从"想知道答案"到"想改变自己"的转变迹象

## 5. 成长阶段判定
判断当前处于哪个阶段（觉醒期/探索期/践行期/内化期），并说明理由。

## 6. 下一步建议
给出2-3个具体的下一步学习或实践建议。

注意：语气要温暖鼓励，像一位理解家长的导师。避免评判性语言，多使用"我注意到""你已经""接下来可以尝试"等表达方式。`;

    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Growth API error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData.error?.message || `API request failed: ${response.status}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      return NextResponse.json({ analysis: content });
    }

    return NextResponse.json(
      { error: "Unexpected response format" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Growth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
