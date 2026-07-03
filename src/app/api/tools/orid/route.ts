import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "请输入至少10个字的描述" },
        { status: 400 }
      );
    }

    const prompt = `你是一个家庭教育反思助手。请将用户杂乱的叙述整理成ORID格式。

用户原文：
"""
${text.trim()}
"""

请严格按以下JSON格式输出，不要添加任何多余文字：

{
  "objective": "（客观事实：发生了什么具体事情，谁？什么时间？做了什么？说了什么？）",
  "reflective": "（感受反应：用户表达了什么情绪？高兴、困惑、焦虑、生气？身体有什么反应？）",
  "interpretive": "（意义解读：这件事的深层含义？和之前的认知有什么关联？冰山之下是什么？）",
  "decisional": "（行动决定：接下来可以怎么做？具体可执行的第一步是什么？）"
}

规则：
1. 不要添加用户没说的信息
2. 如果某部分在原文中缺乏信息，标注"（信息不足）"
3. 保留用户原话中的关键细节和人名
4. 行动决定要具体、可执行、有明确时间
5. 用自然的中文表达，不要生硬的翻译腔`;

    const apiKey = process.env.SILICONFLOW_API_KEY || process.env.DEEPSEEK_API_KEY || "";
    const baseURL = process.env.SILICONFLOW_API_KEY
      ? "https://api.siliconflow.cn/v1"
      : "https://api.deepseek.com/v1";
    const model = process.env.SILICONFLOW_API_KEY
      ? "deepseek-ai/DeepSeek-V3"
      : "deepseek-chat";

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || `AI API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // 提取JSON
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI返回格式异常，请重试" },
        { status: 500 }
      );
    }

    const orid = JSON.parse(jsonMatch[0]);
    return NextResponse.json(orid);
  } catch (error) {
    console.error("ORID API error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
