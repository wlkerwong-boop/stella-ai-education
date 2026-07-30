/**
 * Stella 危机检测与安全路由
 * 
 * 依据：reports/2026-07-30-stella咨询环节方案-Codex.md C 部分
 * - 高风险词断流 → 旗舰模型安全研判 → R2/R3 固定话术锁页 → 失败偏安全降级
 * - 固定话术照抄方案 C3，一字不改
 */

// C2 高风险词（任务书指定 + 同义表达）
const HIGH_RISK_WORDS = [
  "自杀", "想死", "不想活", "活不下去",
  "自残", "割腕", "割手", "伤害自己", "弄伤自己",
  "严重抑郁", "重度抑郁", "抑郁症",
  "彻底拒学", "不上学了", "退学",
  "虐待", "家暴", "被打", "被打伤",
  "性侵", "猥亵", "性骚扰",
  "要杀", "杀死", "弄死", "下毒", "投毒",
  "跳楼", "上吊", "溺水",
];

// C3 固定话术（照抄方案，一字不改）
export const CRISIS_SCRIPTS = {
  child: {
    R1: `我听见你很担心孩子。先暂停普通的教育建议，这件事比方法更重要。请尽快到孩子身边，用平静、直接的方式告诉孩子：\u201C我注意到你很难受，我先陪着你，我们一起找合适的支持。\u201D如果这种状态持续、加重，或你拿不准是否安全，请尽快联系线下具备资质的专业人员进行评估。`,
    R2: `现在先不要继续讨论教育方法。请马上到孩子身边，不让孩子独处，并把可能造成伤害的物品移开。请直接问：\u201C你现在安全吗？我会陪着你。\u201D尽快联系线下具备资质的专业人员或当地紧急支持，由现场成年人判断并采取行动。`,
    R3: `现在先停止聊天。请立即让孩子离开危险物品或危险地点，不要让孩子独处，并请另一位可信成年人一起到场。请根据现场情况立即联系当地紧急服务或就近急诊，由现场人员处理。不要等待线上回复。`,
  },
  parent: {
    R1: `我听见你现在已经很难承受。先暂停讨论孩子和教育方法，请找一位你信任的成年人陪在身边，暂时把照看孩子的任务交给可靠的人。你可以直接说：\u201C我现在状态很差，需要你陪我一下。\u201D如果这种状态持续或加重，请尽快联系线下具备资质的专业人员。`,
    R2: `现在先不要独处，也先不要独自照看孩子。请马上联系一位你信任的成年人到你身边，并远离可能造成伤害的物品或地点。请尽快联系线下具备资质的专业人员或当地紧急支持，由现场人员帮助你确保安全。`,
    R3: `现在先停止聊天。请立即离开危险物品或危险地点，去有其他成年人的地方，不要独处，也不要独自照看孩子。请让身边的人根据现场情况立即联系当地紧急服务或陪你前往就近急诊。不要等待线上回复。`,
  },
};

// 降级通用提示（旗舰模型不可用时）
const FALLBACK_SAFETY_PROMPT =
  "系统检测到你可能正在经历困难时刻。请立即联系一位你信任的成年人陪伴，或拨打当地心理援助热线。如有即时危险，请拨打 110 或前往最近医院急诊。";

// C2 分级分类 prompt（送旗舰模型研判）
const CRISIS_CLASSIFY_PROMPT = `你是一个家庭教育支持系统的安全研判模块。根据家长描述，判断：
1. 风险对象：child（孩子）或 parent（家长自身）
2. 风险等级：
   - R1：明显痛苦/崩溃/无助/严重冲突，但无即时危险信息，能确认当前安全
   - R2：提到自伤/自杀/被伤害/性伤害/严重暴力，或明确表示"不安全"，或家长担心可能伤害自己/孩子/他人
   - R3：正在实施或即将实施伤害，危险人物/物品/地点就在身边，无法保证安全

只返回 JSON，不输出其他内容：
{"subject":"child|parent","level":"R1|R2|R3"}

若无法判断，按更高一级处理。`;

export interface CrisisResult {
  triggered: boolean;
  subject?: "child" | "parent";
  level?: "R1" | "R2" | "R3";
  script: string;
  lockPage: boolean; // R2/R3 锁页
  stopNormalChat: boolean;
}

/**
 * 高风险词检测 —— 先断流，再分级
 */
export function detectCrisisKeywords(text: string): boolean {
  return HIGH_RISK_WORDS.some((word) => text.includes(word));
}

/**
 * 调用旗舰模型做安全研判分级
 */
export async function classifyCrisis(
  userMessage: string,
  apiKey: string,
  baseURL: string,
  model: string
): Promise<CrisisResult> {
  // 先做关键词断流
  if (!detectCrisisKeywords(userMessage)) {
    return { triggered: false, script: "", lockPage: false, stopNormalChat: false };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: CRISIS_CLASSIFY_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0,
        max_tokens: 50,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return failSafe();
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    let subject: "child" | "parent" = "child";
    let level: "R1" | "R2" | "R3" = "R2";

    try {
      const parsed = JSON.parse(content.trim());
      if (parsed.subject === "parent") subject = "parent";
      if (["R1", "R2", "R3"].includes(parsed.level)) level = parsed.level;
    } catch {
      // JSON 解析失败 → 偏安全：R2 + child
    }

    const scene = subject === "parent" ? "parent" : "child";
    const script = CRISIS_SCRIPTS[scene][level];
    const lockPage = level === "R2" || level === "R3";

    return {
      triggered: true,
      subject,
      level,
      script,
      lockPage,
      stopNormalChat: true,
    };
  } catch {
    return failSafe();
  }
}

function failSafe(): CrisisResult {
  return {
    triggered: true,
    subject: "child",
    level: "R2",
    script: `${FALLBACK_SAFETY_PROMPT}\n\n${CRISIS_SCRIPTS.child.R2}`,
    lockPage: true,
    stopNormalChat: true,
  };
}
