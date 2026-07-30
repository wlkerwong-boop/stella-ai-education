/**
 * Stella 工具定义 —— T01-T08 MVP 规格卡 seed 数据
 *
 * 数据来源：materials/2026-07-30-stella工具规格卡与候选清单-Codex.md
 * 状态：K3 已批准（2026-07-30）
 *
 * 话术文案以规格卡 script_examples 为准，一字不改。
 * 未来 Supabase tool_definitions 表就绪后，本文件作为 fallback。
 */

// ====== 类型定义（对齐 tool_definitions 表结构） ======

export type ToolStatus = "draft" | "k3_approved" | "implemented" | "deployed" | "retired";
export type ChildStage = "0-3岁" | "3-6岁" | "1-3年级" | "4-6年级" | "初中" | "高中";
export type PrivacyLevel = "ordinary" | "sensitive" | "prohibited";

export interface InputField {
  field: string;
  label: string;
  type: "enum" | "text" | "number" | "list" | "datetime";
  required: boolean;
  privacy: PrivacyLevel;
  options?: string[];
  placeholder?: string;
}

export interface OperationStep {
  order: number;
  title: string;
  description: string;
  optional?: boolean;
}

export interface ScriptExample {
  context: string;
  text: string;
}

export interface ORIDGuide {
  O: string;
  R: string;
  I: string;
  D: string;
}

export interface ToolDefinition {
  tool_id: string;
  version: string;
  status: ToolStatus;
  name: string;
  source_type: "module8" | "existing" | "independent_candidate";
  source_reference: string[];
  applicable_stages: ChildStage[];
  pain_points: string[];
  theoretical_basis: string[];
  not_for: string[];
  inputs: InputField[];
  outputs: string[];
  operation_steps: OperationStep[];
  script_examples: ScriptExample[];
  orid: ORIDGuide;
  growth_map_fields: string[];
  safety: {
    risk_interrupt: boolean;
    prohibited_storage: string[];
  };
  acceptance: string[];

  // UI 扩展字段（不在 Supabase 表中，仅前端用）
  icon: string;          // lucide-react 图标名
  icon_color: string;
  icon_bg: string;
  estimated_time: string;
}

// ====== T01-T08 工具定义 ======

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // ==================== T01 自我管理系统地图 ====================
  {
    tool_id: "t01-system-map",
    version: "1.0.0",
    status: "k3_approved",
    name: "自我管理系统地图",
    source_type: "module8",
    source_reference: [
      "M8L1 阅读材料＋课前作业（自我管理系统地图）",
      "M8L1 课前作业（反馈回路图，合并入 T01）",
      "哈佛大学发展中儿童中心执行功能活动指南: https://developingchild.harvard.edu/resources/handouts-tools/activities-guide-enhancing-and-practicing-executive-function-skills/"
    ],
    applicable_stages: ["4-6年级", "初中", "高中"],
    pain_points: ["拖延", "反复催促", "总是放弃", "计划执行不下去", "电子产品挤占任务"],
    theoretical_basis: [
      "模块八将自我管理定义为目标、动机、能力、情绪、精力、环境、反馈和调整共同作用的动态系统",
      "执行功能与自我调节支撑计划、专注、自控、觉察和灵活调整；这些能力可以通过互动与练习发展，而不是固定标签",
      "参考：哈佛大学发展中儿童中心执行功能活动指南"
    ],
    not_for: [
      "危机状态下的家庭",
      "家长代孩子填写所有内容",
      "作为诊断工具使用"
    ],
    inputs: [
      { field: "behavior", label: "当前想改变的一个行为", type: "text", required: true, privacy: "ordinary", placeholder: "如：写作业总是拖延到很晚" },
      { field: "scenario", label: "发生场景与频率", type: "text", required: false, privacy: "ordinary", placeholder: "如：每天晚上7-9点，几乎每天" },
      { field: "goal_fact", label: "目标要素：孩子是否清楚要做什么、做到什么程度？", type: "text", required: false, privacy: "ordinary" },
      { field: "motivation_fact", label: "动机要素：这件事对孩子有意义吗？", type: "text", required: false, privacy: "ordinary" },
      { field: "ability_fact", label: "能力要素：孩子具备完成所需的技能吗？", type: "text", required: false, privacy: "ordinary" },
      { field: "emotion_fact", label: "情绪要素：做这件事时通常伴随什么情绪？", type: "text", required: false, privacy: "sensitive" },
      { field: "energy_fact", label: "精力要素：安排在什么时候？那时孩子精力如何？", type: "text", required: false, privacy: "ordinary" },
      { field: "environment_fact", label: "环境要素：周围有什么干扰或支持？", type: "text", required: false, privacy: "ordinary" },
      { field: "feedback_fact", label: "反馈要素：做得好或不好时，通常收到什么反馈？", type: "text", required: false, privacy: "ordinary" },
      { field: "adjustment_fact", label: "调整要素：之前试过什么方法？效果如何？", type: "text", required: false, privacy: "ordinary" },
      { field: "loop_type", label: "当前形成的是助力循环还是阻力循环？", type: "enum", required: false, privacy: "ordinary", options: ["助力循环（越来越顺）", "阻力循环（越来越难）", "不确定"] },
      { field: "selected_factors", label: "选择最可能影响结果的 1-2 条连接", type: "text", required: true, privacy: "ordinary" },
      { field: "loop_description", label: "画出循环：发生什么 → 带来什么 → 下一次更容易发生什么", type: "text", required: false, privacy: "ordinary" },
      { field: "first_adjustment", label: "只选一个小调整", type: "text", required: true, privacy: "ordinary" },
      { field: "observation_metric", label: "一周后能观察到的证据", type: "text", required: true, privacy: "ordinary" },
    ],
    outputs: [
      "八要素雷达式摘要",
      "一条主要连接",
      "一个最值得先试的调整点",
      "一周后观察指标"
    ],
    operation_steps: [
      { order: 1, title: "选择行为", description: "只选一个可观察行为，不选模糊感受" },
      { order: 2, title: "检视八要素", description: "分别查看目标、动机、能力、情绪、精力、环境、反馈、调整八个要素，不要求全部填写" },
      { order: 3, title: "选择关键连接", description: "选择最可能影响结果的 1-2 条连接" },
      { order: 4, title: "画出循环", description: "描述「发生什么 → 带来什么 → 下一次更容易发生什么」的循环" },
      { order: 5, title: "选择一个调整", description: "只选一个小调整，不试图一次改变所有" },
      { order: 6, title: "定义观察指标", description: "定义一周后能观察到的证据，可量化最好" },
    ],
    script_examples: [
      {
        context: "开始使用时",
        text: "我们先不判断你够不够自律，只一起看看这个系统哪里增加了阻力。八个部分里，你觉得哪一个最值得先看？"
      },
      {
        context: "选择调整点时",
        text: "这不是找谁的错。我们只选一个能改变的小地方，试一周再看反馈。"
      }
    ],
    orid: {
      O: "这周具体发生了几次？在什么场景？",
      R: "哪一步最费力？哪一步意外顺利？",
      I: "这说明哪个系统连接可能在起作用？",
      D: "下周保留什么、改变什么？"
    },
    growth_map_fields: [
      "topic", "observed_behavior", "system_factors_selected",
      "loop_type", "first_adjustment", "observation_metric", "review_date"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签", "身份标签如「孩子懒/自制力差」"]
    },
    acceptance: [
      "不输出身份标签",
      "最多选择两个优先因素",
      "结果必须含可观察指标和复盘日期",
      "风险词命中即中断"
    ],
    icon: "Map",
    icon_color: "#c4753f",
    icon_bg: "#f5e6d8",
    estimated_time: "15-20分钟",
  },

  // ==================== T02 假期梦想清单 ====================
  {
    tool_id: "t02-wish-list",
    version: "1.0.0",
    status: "k3_approved",
    name: "假期梦想清单",
    source_type: "module8",
    source_reference: [
      "M8L2 逐字稿 01:26 附近（从体验、学习、帮助、留下成果等方向找目标）",
      "自我决定理论教育应用: https://selfdeterminationtheory.org/topics/application-education/"
    ],
    applicable_stages: ["1-3年级", "4-6年级", "初中", "高中"],
    pain_points: ["假期无目标", "计划全由家长制定", "孩子只想被动娱乐"],
    theoretical_basis: [
      "模块八逐字稿提出从「想体验、想学习、想帮助、想留下什么」等类别引导孩子列清单",
      "自我决定理论认为自主、胜任与联结需要得到支持，有助于形成更自主的动机"
    ],
    not_for: [
      "家长替孩子勾选所有项",
      "把未完成解释为「不自律」",
      "当作任务清单给孩子施压"
    ],
    inputs: [
      { field: "experience_wish", label: "想体验什么？（如：尝试一次露营、学做一道菜）", type: "text", required: false, privacy: "ordinary", placeholder: "孩子自己写，不知道可空" },
      { field: "learn_wish", label: "想学习什么？（如：学会骑自行车、学会一首曲子）", type: "text", required: false, privacy: "ordinary" },
      { field: "help_wish", label: "想帮助谁/做什么？（如：帮奶奶浇花、教弟弟认字）", type: "text", required: false, privacy: "ordinary" },
      { field: "create_wish", label: "想留下什么？（如：画一幅画、写一篇故事）", type: "text", required: false, privacy: "ordinary" },
      { field: "selected_wishes", label: "孩子自主选出最想靠近的 1-3 项", type: "list", required: true, privacy: "ordinary" },
      { field: "first_action", label: "把一项翻译成七天内可做的第一步", type: "text", required: true, privacy: "ordinary" },
      { field: "support_needed", label: "需要家长支持的资源", type: "text", required: false, privacy: "ordinary" },
    ],
    outputs: [
      "梦想清单",
      "孩子自主选出的 1-3 项",
      "每项的第一个小行动",
      "需要家长支持的资源"
    ],
    operation_steps: [
      { order: 1, title: "自由写愿望", description: "孩子自由写「想体验 / 想学习 / 想帮助 / 想留下」，不要求四类填满" },
      { order: 2, title: "家长提供选项（可选）", description: "孩子不知道时，家长提供 3-4 个可选方向，不代填" },
      { order: 3, title: "孩子自主选择", description: "孩子自己选出最想靠近的 1-3 项" },
      { order: 4, title: "翻译成第一步", description: "把一项翻译成七天内可做的第一步" },
      { order: 5, title: "家长确认资源", description: "家长只确认安全、预算和必要资源" },
    ],
    script_examples: [
      {
        context: "开始使用时",
        text: "这不是我给你的任务单，是你的愿望清单。你可以选、可以不选，也可以写一个我没想到的。"
      },
      {
        context: "帮助选择时",
        text: "这几项里，哪一项是你真想做，不是觉得自己应该做？"
      }
    ],
    orid: {
      O: "你写下了哪些愿望？",
      R: "哪一项最让你期待？",
      I: "它对你有什么意义？",
      D: "你准备先做哪一个最小动作？"
    },
    growth_map_fields: [
      "child_stage", "wish_categories", "selected_wishes",
      "first_action", "support_needed", "review_date"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签"]
    },
    acceptance: [
      "家长不能替孩子勾选",
      "不把未完成解释为「不自律」",
      "每期最多激活三项",
      "输出必须包含孩子可修改入口"
    ],
    icon: "Star",
    icon_color: "#e88d5a",
    icon_bg: "#fce8d8",
    estimated_time: "10-15分钟",
  },

  // ==================== T03 今日三件大事 ====================
  {
    tool_id: "t03-top3",
    version: "1.0.0",
    status: "k3_approved",
    name: "今日三件大事",
    source_type: "module8",
    source_reference: [
      "M8L2 逐字稿 01:49 附近（降低计划复杂度，让孩子自己排序）",
      "M8L2 逐字稿 01:42 附近（精力与高能时段）"
    ],
    applicable_stages: ["1-3年级", "4-6年级", "初中"],
    pain_points: ["计划过满", "优先级混乱", "一天结束仍无完成感"],
    theoretical_basis: [
      "模块八逐字稿明确提出「一天三件大事，由孩子自己安排」，并在复盘中根据精力和结果调整顺序",
      "该工具训练计划、排序和监控，不把时间表做成家长监督表"
    ],
    not_for: [
      "家长把三件事变成隐形任务清单",
      "做红黄绿人格评分",
      "未完成触发惩罚"
    ],
    inputs: [
      { field: "task1", label: "第一件事", type: "text", required: true, privacy: "ordinary" },
      { field: "task2", label: "第二件事（可空）", type: "text", required: false, privacy: "ordinary" },
      { field: "task3", label: "第三件事（可空）", type: "text", required: false, privacy: "ordinary" },
      { field: "energy_level", label: "每件事的耗能级别", type: "enum", required: false, privacy: "ordinary", options: ["高耗能", "中等", "低耗能"] },
      { field: "planned_order", label: "孩子按自己高能时段排序", type: "text", required: true, privacy: "ordinary" },
      { field: "min_standard", label: "为每件事写一个最低完成标准", type: "text", required: false, privacy: "ordinary", placeholder: "如：数学做3道题就算完成" },
      { field: "completion_fact", label: "晚间复盘：实际完成到哪一步？", type: "text", required: false, privacy: "ordinary" },
      { field: "adjustment", label: "需要时调整明日安排", type: "text", required: false, privacy: "ordinary" },
    ],
    outputs: [
      "孩子自己排序的三件事",
      "开始时点",
      "最低完成标准",
      "晚间复盘入口"
    ],
    operation_steps: [
      { order: 1, title: "选出不超过三件", description: "从愿望、任务和生活中选不超过三件" },
      { order: 2, title: "标记耗能", description: "标记「高耗能 / 中等 / 低耗能」" },
      { order: 3, title: "按高能时段排序", description: "孩子按自己的高能时段排序" },
      { order: 4, title: "写最低完成标准", description: "为每件事写一个最低完成标准，降低压力" },
      { order: 5, title: "晚间复盘", description: "晚间只看事实，不评分；需要时调整明日安排" },
    ],
    script_examples: [
      {
        context: "开始使用时",
        text: "今天不把时间塞满，只选三件你认为重要的事。顺序由你安排，我可以帮你看精力和资源。"
      },
      {
        context: "晚间复盘时",
        text: "没完成的那件事给了我们什么信息？明天你想保留顺序，还是换一个时段？"
      }
    ],
    orid: {
      O: "三件事实际完成到哪一步？",
      R: "哪个时段最顺、最累？",
      I: "你的精力和任务难度有什么关系？",
      D: "明天顺序怎么调？"
    },
    growth_map_fields: [
      "daily_top3", "energy_level", "planned_order",
      "completion_fact", "adjustment"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签"]
    },
    acceptance: [
      "不允许超过三件",
      "不做红黄绿人格评分",
      "未完成只触发复盘，不触发惩罚",
      "家长查看记录需符合家庭授权"
    ],
    icon: "ListChecks",
    icon_color: "#5a7a6a",
    icon_bg: "#e8f0ec",
    estimated_time: "5-10分钟",
  },

  // ==================== T04 微步启动与脚手架 ====================
  {
    tool_id: "t04-micro-step",
    version: "1.0.0",
    status: "k3_approved",
    name: "微步启动与脚手架",
    source_type: "module8",
    source_reference: [
      "M8L2 阅读材料＋课前作业（微步拆解，降低启动阻力）",
      "M8L2 阅读材料（能力缺口与脚手架，区分「不愿做」和「暂时不会做」）",
      "哈佛大学执行功能与自我调节活动指南: https://developingchild.harvard.edu/resources/handouts-tools/activities-guide-enhancing-and-practicing-executive-function-skills/"
    ],
    applicable_stages: ["1-3年级", "4-6年级", "初中"],
    pain_points: ["知道要做却迟迟不开始", "面对复杂任务卡住", "持续依赖提醒"],
    theoretical_basis: [
      "模块八第二课强调目标、动机、能力共同构成启动系统；能力不足时搭脚手架，能力提升后逐步撤除",
      "执行功能并非出生即成熟，可在适龄挑战与练习中发展"
    ],
    not_for: [
      "把所有阻力都归因于能力",
      "由家长代做",
      "持续严重功能受损——只提示寻求适当线下支持，不诊断"
    ],
    inputs: [
      { field: "task_description", label: "原任务是什么？", type: "text", required: true, privacy: "ordinary" },
      { field: "stuck_point", label: "最卡在哪里？", type: "enum", required: true, privacy: "ordinary", options: ["坐不到桌前", "不知先做什么", "做到一半卡住"] },
      { field: "can_do", label: "孩子能独立完成的部分", type: "text", required: false, privacy: "ordinary" },
      { field: "need_hint", label: "需要一点提示的部分", type: "text", required: false, privacy: "ordinary" },
      { field: "need_learn", label: "暂时不会、需要一起学的部分", type: "text", required: false, privacy: "ordinary" },
      { field: "micro_step", label: "最小启动动作（2-5分钟能完成）", type: "text", required: true, privacy: "ordinary" },
      { field: "support_level", label: "家长支持级别", type: "enum", required: true, privacy: "ordinary", options: ["在旁边但不插手", "给一个提示", "一起做第一步"] },
      { field: "scaffold_removal", label: "何时减少提示？（撤架条件）", type: "text", required: true, privacy: "ordinary", placeholder: "如：连续3天独立完成第一步后，提示减少到只在开始前给一个提醒" },
      { field: "independent_ratio", label: "一周后孩子独立完成比例", type: "text", required: false, privacy: "ordinary" },
    ],
    outputs: [
      "最小启动动作",
      "3-5 步任务链",
      "家长支持级别",
      "撤架条件"
    ],
    operation_steps: [
      { order: 1, title: "诊断卡点", description: "区分「坐不到桌前 / 不知先做什么 / 做到一半卡住」" },
      { order: 2, title: "缩小启动动作", description: "把任务缩到一个 2-5 分钟启动动作" },
      { order: 3, title: "能力标记", description: "孩子标记「我会 / 需要一点提示 / 暂时不会」" },
      { order: 4, title: "设定支持级别", description: "家长只对后两类提供支持" },
      { order: 5, title: "写撤架条件", description: "写清何时减少提示" },
      { order: 6, title: "一周复查", description: "一周后看孩子独立完成比例" },
    ],
    script_examples: [
      {
        context: "缩任务时",
        text: "我们不讨论整项任务，只找一个你愿意开始的最小动作。你想从哪一步开始？"
      },
      {
        context: "评估能力时",
        text: "哪一步你能自己做，哪一步只需要一个提示，哪一步需要一起学？"
      }
    ],
    orid: {
      O: "你从哪一步开始？用了多久？",
      R: "启动前后感觉有什么变化？",
      I: "真正的能力缺口在哪里？",
      D: "下一次哪一级支持可以撤掉？"
    },
    growth_map_fields: [
      "task_type", "startup_block", "micro_step",
      "support_level", "independent_ratio", "scaffold_removal_rule"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签"]
    },
    acceptance: [
      "不把所有阻力都归因于能力",
      "不由家长代做",
      "必须包含撤架条件",
      "若持续严重功能受损，只提示寻求适当线下支持，不诊断"
    ],
    icon: "Footprints",
    icon_color: "#8b7355",
    icon_bg: "#f0ebe4",
    estimated_time: "10-15分钟",
  },

  // ==================== T05 情绪—压力—精力仪表盘 ====================
  {
    tool_id: "t05-dashboard",
    version: "1.0.0",
    status: "k3_approved",
    name: "情绪—压力—精力仪表盘",
    source_type: "module8",
    source_reference: [
      "M8L3 阅读材料＋课前作业（情绪觉察与转念，把情绪当信号）",
      "M8L3 阅读材料（压力阀门与恢复）",
      "Lieberman 等人情绪命名研究: https://pubmed.ncbi.nlm.nih.gov/17576282/",
      "后续时机与强度研究: https://pubmed.ncbi.nlm.nih.gov/36580454/"
    ],
    applicable_stages: ["4-6年级", "初中", "高中"],
    pain_points: ["情绪波动", "压力累积", "精力不足", "注意力难以维持", "任务安排与状态不匹配"],
    theoretical_basis: [
      "模块八第三课将情绪视为信号、压力视为需要调节的系统变量、精力视为时间安排前提",
      "「把感受说出来」可作为情绪觉察候选做法，但研究也提示作用受时机与强度影响，因此工具只做觉察，不宣称治疗"
    ],
    not_for: [
      "作为诊断工具",
      "高风险表达——立即切换危机契约",
      "分数持续异常——只提示线下专业支持选择"
    ],
    inputs: [
      { field: "emotion_label", label: "当前情绪词（可跳过）", type: "text", required: false, privacy: "sensitive", placeholder: "如：烦躁、紧张、平静……" },
      { field: "stress_score", label: "压力 0-10 分", type: "number", required: true, privacy: "sensitive" },
      { field: "energy_score", label: "精力 0-10 分", type: "number", required: true, privacy: "ordinary" },
      { field: "sleep_fact", label: "昨晚睡了几个小时？", type: "text", required: false, privacy: "ordinary" },
      { field: "consecutive_tasks", label: "连续做了多久任务？", type: "text", required: false, privacy: "ordinary" },
      { field: "distraction_fact", label: "有什么干扰源？", type: "text", required: false, privacy: "ordinary" },
      { field: "most_draining", label: "今天最耗能的活动", type: "text", required: false, privacy: "ordinary" },
      { field: "most_restoring", label: "今天最恢复的活动", type: "text", required: false, privacy: "ordinary" },
      { field: "current_state", label: "现在适合做什么？", type: "enum", required: true, privacy: "ordinary", options: ["高耗能任务", "低耗能任务", "先恢复"] },
      { field: "adjustment_action", label: "选择一个减阻或恢复动作", type: "text", required: true, privacy: "ordinary" },
      { field: "recheck_at", label: "约定什么时候复测？", type: "text", required: false, privacy: "ordinary" },
    ],
    outputs: [
      "当前仪表盘（情绪/压力/精力）",
      "高耗能任务建议时段",
      "一个减阻动作",
      "一个恢复动作",
      "复测时间"
    ],
    operation_steps: [
      { order: 1, title: "情绪觉察", description: "选择或自填一个情绪词（可跳过）" },
      { order: 2, title: "压力打分", description: "给压力打分 0-10" },
      { order: 3, title: "精力打分", description: "给精力打分 0-10" },
      { order: 4, title: "记录事实", description: "只记录相关事实（睡眠、任务、干扰），不解释病因" },
      { order: 5, title: "判断状态", description: "识别「现在适合高耗能任务 / 低耗能任务 / 先恢复」" },
      { order: 6, title: "选择行动", description: "选择一个环境减阻或恢复动作；约定复测时间" },
    ],
    script_examples: [
      {
        context: "打分时",
        text: "这个分数不是评价你，只帮助我们决定现在适合做什么。你的压力和精力分别在几分？"
      },
      {
        context: "选行动时",
        text: "你现在更需要把任务切小、换到干扰少的地方，还是先恢复十分钟？"
      }
    ],
    orid: {
      O: "睡眠、任务和干扰发生了什么？",
      R: "情绪、压力、精力各是多少？",
      I: "什么在消耗，什么能恢复？",
      D: "下一时段安排什么任务？"
    },
    growth_map_fields: [
      "emotion_label_optional", "stress_score", "energy_score",
      "objective_factors", "selected_adjustment", "recheck_at"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签"]
    },
    acceptance: [
      "情绪词可跳过",
      "不由分数生成诊断",
      "高风险表达立即切换危机契约",
      "分数持续异常只提示线下专业支持选择"
    ],
    icon: "Gauge",
    icon_color: "#c4753f",
    icon_bg: "#f5e6d8",
    estimated_time: "5-10分钟",
  },

  // ==================== T06 3L 每日复盘 ====================
  {
    tool_id: "t06-3l-review",
    version: "1.0.0",
    status: "k3_approved",
    name: "3L 每日复盘",
    source_type: "module8",
    source_reference: [
      "M8L2 逐字稿 01:44 附近（Learned / Loved / Lesson 三问快速复盘）"
    ],
    applicable_stages: ["1-3年级", "4-6年级", "初中", "高中"],
    pain_points: ["一天只有完成/没完成", "错误只带来自责", "家长复盘变检查"],
    theoretical_basis: [
      "模块八逐字稿给出三个问题：Learned（学到了什么）、Loved（喜欢/珍惜什么）、Lesson（从错误或困难中得到什么经验）",
      "工具目标是快速回顾，不是绩效考核"
    ],
    not_for: [
      "作为绩效考核工具",
      "家长纠正孩子的答案",
      "自动公开给家庭其他成员"
    ],
    inputs: [
      { field: "learned", label: "Learned：今天学到了什么？", type: "text", required: false, privacy: "ordinary", placeholder: "允许空；低年级可口述" },
      { field: "loved", label: "Loved：今天喜欢、感激或享受什么？", type: "text", required: false, privacy: "ordinary" },
      { field: "lesson", label: "Lesson：今天哪个错误/困难带来了一条经验？", type: "text", required: false, privacy: "ordinary" },
      { field: "tomorrow_note", label: "明天想记住什么？（可选）", type: "text", required: false, privacy: "ordinary" },
    ],
    outputs: [
      "当日三条成长摘要",
      "一个明日提醒",
      "连续记录趋势"
    ],
    operation_steps: [
      { order: 1, title: "Learned", description: "今天学到了什么？（新知、技能、发现都算）" },
      { order: 2, title: "Loved", description: "今天喜欢、感激或享受什么？（再小的快乐都值得记）" },
      { order: 3, title: "Lesson", description: "今天哪个错误/困难带来了一条经验？（不翻译成「犯错榜」）" },
      { order: 4, title: "明日提醒", description: "孩子自己选是否形成明日提醒；家长不纠正答案" },
    ],
    script_examples: [
      {
        context: "开始使用时",
        text: "我们只用三分钟回顾，不检查任务。今天你学到了什么、喜欢什么、从哪件不顺利的事里得到了一点经验？"
      }
    ],
    orid: {
      O: "今天发生的一件事",
      R: "最喜欢/最在意的感受",
      I: "学到或得到的经验",
      D: "明天想记住什么"
    },
    growth_map_fields: [
      "learned", "loved", "lesson", "tomorrow_note", "recorded_at"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签"]
    },
    acceptance: [
      "不自动公开给家庭其他成员",
      "不把 Lesson 翻译成「犯错榜」",
      "单次填写目标少于三分钟",
      "允许语音转文字后由用户确认摘要"
    ],
    icon: "BookOpen",
    icon_color: "#5a7a6a",
    icon_bg: "#e8f0ec",
    estimated_time: "3-5分钟",
  },

  // ==================== T07 反馈—反思—调整卡 ====================
  {
    tool_id: "t07-feedback",
    version: "1.0.0",
    status: "k3_approved",
    name: "反馈—反思—调整卡",
    source_type: "module8",
    source_reference: [
      "M8L4 阅读材料＋课前作业（行动后收集事实、解释系统、决定调整）"
    ],
    applicable_stages: ["4-6年级", "初中", "高中"],
    pain_points: ["一次失败就否定自己", "方法失效仍重复", "家长把评价当反馈"],
    theoretical_basis: [
      "模块八第四课规定连续优化流程：行动 → 反馈 → 反思 → 调整 → 下一轮行动",
      "反馈是事实，反思是解释系统，调整是决定下一步；三者不能混为评价"
    ],
    not_for: [
      "变成对孩子的评价会",
      "一次改太多（调整项默认最多一个）"
    ],
    inputs: [
      { field: "action_description", label: "本轮行动是什么？", type: "text", required: true, privacy: "ordinary" },
      { field: "result_facts", label: "结果事实（只写数据，不评价）", type: "text", required: true, privacy: "ordinary" },
      { field: "process_facts", label: "过程事实（过程中发生了什么）", type: "text", required: false, privacy: "ordinary" },
      { field: "effective_factors", label: "有效部分（哪些方法有用？）", type: "text", required: false, privacy: "ordinary" },
      { field: "friction_factors", label: "阻力因素（哪里增加了阻力？）", type: "text", required: false, privacy: "ordinary" },
      { field: "system_explanation", label: "从八系统要素解释原因", type: "text", required: false, privacy: "ordinary" },
      { field: "keep", label: "保留什么？", type: "text", required: true, privacy: "ordinary" },
      { field: "change", label: "改变什么？", type: "text", required: true, privacy: "ordinary" },
      { field: "try", label: "尝试什么？", type: "text", required: false, privacy: "ordinary" },
      { field: "next_review", label: "下一轮观察日期", type: "datetime", required: true, privacy: "ordinary" },
    ],
    outputs: [
      "保留项",
      "改变项",
      "尝试项",
      "下一轮观察指标"
    ],
    operation_steps: [
      { order: 1, title: "写事实", description: "只写事实和数据，区分「发生了什么」和「我怎么评价」" },
      { order: 2, title: "系统解释", description: "从八系统要素解释原因" },
      { order: 3, title: "选关键调整", description: "用二八原则只选一个关键调整" },
      { order: 4, title: "写「保留/改变/尝试」", description: "不用推翻全部，只记录三个决定" },
      { order: 5, title: "设观察日期", description: "设下一轮观察日期" },
    ],
    script_examples: [
      {
        context: "收集反馈时",
        text: "我们先不评价好坏，只收集系统给出的信息。哪些方法有效？哪里增加了阻力？"
      },
      {
        context: "决定调整时",
        text: "下一轮不用推翻全部。你想保留什么、改变什么、尝试什么？"
      }
    ],
    orid: {
      O: "结果和过程数据是什么？",
      R: "你怎么看待这次结果？",
      I: "哪些系统因素可能起作用？",
      D: "下一轮只改哪一个关键点？"
    },
    growth_map_fields: [
      "action_id", "feedback_facts", "effective_factors",
      "friction_factors", "keep", "change", "try", "next_review"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签", "身份标签"]
    },
    acceptance: [
      "事实与评价分栏",
      "调整项默认最多一个",
      "不生成身份标签",
      "可关联 T01、T03、T04、T05 的历史记录"
    ],
    icon: "RefreshCw",
    icon_color: "#8b7355",
    icon_bg: "#f0ebe4",
    estimated_time: "10-15分钟",
  },

  // ==================== T08 ORID 家庭实践记录 ====================
  {
    tool_id: "t08-orid-record",
    version: "1.0.0",
    status: "k3_approved",
    name: "ORID 家庭实践记录",
    source_type: "module8",
    source_reference: [
      "四课课前作业（记录实践过程并沉淀成长）"
    ],
    applicable_stages: ["0-3岁", "3-6岁", "1-3年级", "4-6年级", "初中", "高中"],
    pain_points: ["实践后无沉淀", "只记录事件不记录认识与决定", "成长图谱缺少连续数据"],
    theoretical_basis: [
      "模块八四课均要求用 ORID 记录家庭实践",
      "ORID 在 Stella 中是数据沉淀结构，不等于强制写长日记"
    ],
    not_for: [
      "O 栏自动混入诊断和推断",
      "逐字对话上图谱",
      "直接识别信息未经拦截"
    ],
    inputs: [
      { field: "objective", label: "O 客观事实：发生了什么？", type: "text", required: true, privacy: "ordinary", placeholder: "用一句话说发生了什么" },
      { field: "reflective", label: "R 感受反应：当时有什么感受或反应？", type: "text", required: false, privacy: "sensitive" },
      { field: "interpretive", label: "I 意义认识：这件事带来什么认识？", type: "text", required: false, privacy: "ordinary" },
      { field: "decisional", label: "D 行动决定：下一步决定做什么？", type: "text", required: true, privacy: "ordinary" },
    ],
    outputs: [
      "一条去标识化成长事件",
      "选定行动",
      "后续复盘日期"
    ],
    operation_steps: [
      { order: 1, title: "O 客观事实", description: "客观发生了什么？像摄像机一样记录" },
      { order: 2, title: "R 感受反应", description: "当时有什么感受或反应？" },
      { order: 3, title: "I 意义认识", description: "这件事带来什么认识？" },
      { order: 4, title: "D 行动决定", description: "下一步决定做什么？" },
      { order: 5, title: "确认与预览", description: "确认摘要和写入字段；可撤销或编辑" },
    ],
    script_examples: [
      {
        context: "开始使用时",
        text: "不需要写完整故事。先用一句话说发生了什么，再说你的感受、得到的认识和下一步决定。"
      }
    ],
    orid: {
      O: "客观发生了什么？",
      R: "当时有什么感受或反应？",
      I: "这件事带来什么认识？",
      D: "下一步决定做什么？"
    },
    growth_map_fields: [
      "event_type", "objective_fact", "reflection",
      "interpretation", "decision", "tool_id", "review_date"
    ],
    safety: {
      risk_interrupt: true,
      prohibited_storage: ["逐字对话", "直接识别信息", "诊断标签", "推断"]
    },
    acceptance: [
      "O 栏不允许自动混入诊断和推断",
      "逐字对话不上图谱",
      "直接识别信息在写入前拦截",
      "用户能预览、修改、撤销"
    ],
    icon: "Brain",
    icon_color: "#c4753f",
    icon_bg: "#f5e6d8",
    estimated_time: "5-10分钟",
  },
];

// ====== 查询函数 ======

export function getApprovedTools(): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter(t => t.status === "k3_approved");
}

export function getToolById(toolId: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find(t => t.tool_id === toolId);
}

export function getToolStages(): ChildStage[] {
  const stages = new Set<ChildStage>();
  for (const t of TOOL_DEFINITIONS) {
    for (const s of t.applicable_stages) {
      stages.add(s);
    }
  }
  return Array.from(stages).sort();
}

/** 获取某个阶段的工具列表 */
export function getToolsByStage(stage: ChildStage): ToolDefinition[] {
  return getApprovedTools().filter(t => t.applicable_stages.includes(stage));
}

/** 工具预设提问（用于提问示范模版入口） */
export function getToolPresetQuestions(toolId: string): string[] {
  const tool = getToolById(toolId);
  if (!tool) return [];

  // 每个工具提供 1-2 个预设提问，让用户一键跳转 chat
  const presetMap: Record<string, string[]> = {
    "t01-system-map": [
      "孩子写作业总是拖延，我想用系统地图帮他看看哪个环节出了问题，从哪入手比较好？",
      "孩子最近总是放弃，刚定好的计划执行两天就不干了，怎么用系统思维来分析？"
    ],
    "t02-wish-list": [
      "快放暑假了，孩子说「没什么想做的」，只想着玩手机。怎么帮他找到真正想做的事情？"
    ],
    "t03-top3": [
      "孩子每天计划列了一大堆，到晚上发现只完成了一两件，怎么帮他缩小到三件大事？"
    ],
    "t04-micro-step": [
      "孩子知道要写作业但就是不动，每次都要我催好几遍。这个「微步启动」方法具体怎么用？"
    ],
    "t05-dashboard": [
      "孩子放学回来情绪很差，什么都不想做。我该先让他休息还是督促他完成任务？",
      "怎么帮孩子觉察自己的情绪状态？他说「不知道」的时候我该怎么引导？"
    ],
    "t06-3l-review": [
      "每天问孩子「今天怎么样」，他都说「还行」，怎么用3L复盘让他愿意多聊一点？"
    ],
    "t07-feedback": [
      "孩子期中考试成绩不理想，他自己也很沮丧。怎么帮他做一次「不评价」的反思和调整？"
    ],
    "t08-orid-record": [
      "我们做了一些家庭教育的尝试，但过段时间就忘了做了什么。怎么用ORID把这些实践记录下来？"
    ],
  };

  return presetMap[toolId] || [];
}
