"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, Loader2, CheckCircle2, MessageCircle,
  Eye, EyeOff, AlertTriangle, ChevronLeft, ChevronRight,
  SkipForward, Lightbulb, ShieldAlert,
} from "lucide-react";
import {
  getToolById, getToolPresetQuestions,
  type ChildStage, type InputField,
} from "@/lib/tool-definitions";
import { getCurrentStudent } from "@/lib/tools-storage";
import { saveToolUsage, withdrawToolUsage, type Visibility } from "@/lib/tool-usage-storage";
import { detectCrisisKeywords, CRISIS_SCRIPTS } from "@/lib/crisis";

const ALL_STAGES: ChildStage[] = ["0-3岁", "3-6岁", "1-3年级", "4-6年级", "初中", "高中"];

const STAGE_LABELS: Record<ChildStage, string> = {
  "0-3岁": "👶 0-3岁",
  "3-6岁": "🧒 3-6岁",
  "1-3年级": "📚 1-3年级",
  "4-6年级": "📖 4-6年级",
  "初中": "🏫 初中",
  "高中": "🎓 高中",
};

// 图标名到 lucide 组件的简易映射
const ICON_MAP: Record<string, string> = {
  Map: "🗺️", Star: "⭐", ListChecks: "✅", Footprints: "👣",
  Gauge: "📊", BookOpen: "📖", RefreshCw: "🔄", Brain: "🧠",
};

export default function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = use(params);
  const router = useRouter();
  const tool = getToolById(toolId);
  const user = getCurrentStudent();

  // State
  const [step, setStep] = useState(-1); // -1 = 阶段选择, 0..N-1 = 工具步骤, N = ORID, N+1 = 完成
  const [childStage, setChildStage] = useState<ChildStage | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [oridData, setOridData] = useState<Record<string, string>>({ O: "", R: "", I: "", D: "" });
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [crisisLocked, setCrisisLocked] = useState(false);

  // Redirect if tool not found or not logged in
  useEffect(() => {
    if (!tool) router.replace("/tools");
    if (!user) router.push("/auth/login");
  }, [tool, user, router]);

  if (!tool || !user) return null;

  const totalSteps = tool.operation_steps.length;
  const isOnStageSelect = step === -1;
  const isOnORID = step === totalSteps;
  const isComplete = step > totalSteps;

  // 获取当前步骤对应的输入字段
  const currentInputs = step >= 0 && step < totalSteps
    ? tool.inputs.slice(step, step + 1)
    : [];

  const currentStepInfo = step >= 0 && step < totalSteps
    ? tool.operation_steps[step]
    : null;

  // 危机检测：命中即中断工具流程，切换危机契约（规格卡要求）
  const checkCrisis = (value: string) => {
    if (detectCrisisKeywords(value)) {
      setCrisisLocked(true);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (typeof value === "string") checkCrisis(value);
  };

  const handleNext = () => {
    if (isOnStageSelect && !childStage) return;
    setStep(s => Math.min(s + 1, totalSteps + 1));
  };

  const handlePrev = () => {
    setStep(s => Math.max(s - 1, -1));
  };

  const handleSkip = () => {
    setStep(s => Math.min(s + 1, totalSteps + 1));
  };

  const handleSave = () => {
    setIsSaving(true);
    const record = saveToolUsage({
      tool_definition_id: tool.tool_id,
      tool_version: tool.version,
      user_id: user.userId,
      child_stage: childStage || "",
      input_data: formData,
      output_data: buildOutput(),
      orid_summary: oridData,
      growth_event_id: null, // 未来由 growth API 生成
      visibility,
      status: "completed",
    });
    setSavedRecordId(record.id);
    setIsSaving(false);
    setSaved(true);
    setStep(totalSteps + 1);
  };

  const handleWithdraw = () => {
    if (savedRecordId) {
      withdrawToolUsage(savedRecordId);
      setSaved(false);
      setSavedRecordId(null);
      setStep(totalSteps); // 回到 ORID 页重新填写
    }
  };

  const buildOutput = (): Record<string, any> => {
    const output: Record<string, any> = {};
    for (const o of tool.outputs) {
      output[o] = "已记录";
    }
    return output;
  };

  // "问 Stella" 跳转
  const handleAskStella = (prompt?: string) => {
    const text = prompt || getToolPresetQuestions(toolId)[0] || `我想聊聊关于"${tool.name}"这个工具的使用体验`;
    router.push(`/chat?prompt=${encodeURIComponent(text)}`);
  };

  // ====== 危机锁页：命中即中断工具流程，切换危机契约 ======
  if (crisisLocked) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl border-2 border-red-200 shadow-xl p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-700 mb-2">安全提醒</h2>
              <p className="text-sm text-[#2d2a26] leading-relaxed whitespace-pre-wrap">
                {CRISIS_SCRIPTS.child.R1}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#9a9590] mb-4">
            工具流程已暂停。如有即时危险，请拨打 110 或前往最近医院急诊。
          </p>
          <Link
            href="/tools"
            className="block w-full py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors text-center"
          >
            退出工具台
          </Link>
        </motion.div>
      </div>
    );
  }

  // ====== 渲染 ======

  // 完成页
  if (isComplete && saved) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-[#e8f0ec] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#5a7a6a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">记录已保存！</h2>
          <p className="text-[#9a9590] mb-4">
            你使用「{tool.name}」的记录已汇入成长图谱。
          </p>

          {/* 图谱字段预览 */}
          <div className="bg-white rounded-xl border border-[#e8e4df] p-4 mb-6 text-left">
            <h4 className="text-sm font-medium text-[#2d2a26] mb-2">📋 将写入成长图谱的字段</h4>
            <div className="flex flex-wrap gap-1.5">
              {tool.growth_map_fields.map(f => (
                <span key={f} className="px-2 py-0.5 rounded-md bg-[#e8f0ec] text-[#5a7a6a] text-xs">
                  {f}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#9a9590] mt-3">
              {/* 请 K3 补审 */}记录已保存。可在成长图谱中随时查看或撤销。
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleWithdraw}
              className="text-sm text-[#9a9590] hover:text-red-500 transition-colors underline"
            >
              撤销本次记录
            </button>
            <button
              onClick={() => handleAskStella()}
              className="w-full py-3 rounded-xl bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              基于结果去问问 Stella 老师
            </button>
            <Link
              href="/tools"
              className="text-sm text-[#5a7a6a] hover:text-[#2d2a26] transition-colors mt-2"
            >
              ← 返回工具台
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回工具台</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">{ICON_MAP[tool.icon] || "📋"}</span>
            <span className="font-medium text-[#2d2a26] text-sm">{tool.name}</span>
          </div>
          <div />
        </div>

        {/* Progress bar */}
        {!isOnStageSelect && !isOnORID && (
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="flex gap-1.5">
              {tool.operation_steps.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i <= step ? "bg-[#c4753f]" : "bg-[#e8e4df]"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-[#9a9590]">
                步骤 {step + 1} / {totalSteps}
              </span>
              {currentStepInfo?.optional && (
                <span className="text-xs text-[#9a9590]">可选</span>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Stage Selection */}
          {isOnStageSelect && (
            <motion.div
              key="stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: tool.icon_bg }}>
                  <span className="text-3xl">{ICON_MAP[tool.icon] || "📋"}</span>
                </div>
                <h1 className="text-2xl font-bold text-[#2d2a26] mb-2">{tool.name}</h1>
                <p className="text-[#9a9590] max-w-md mx-auto leading-relaxed">
                  预计用时 {tool.estimated_time} · 适用 {tool.applicable_stages.join("、")}
                </p>

                {/* 痛点标签 */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {tool.pain_points.map(p => (
                    <span key={p} className="px-3 py-1 rounded-full bg-[#f5f0eb] text-[#9a9590] text-xs">
                      {p}
                    </span>
                  ))}
                </div>

                {/* 不适用提示 */}
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-left">
                  <p className="text-xs text-red-600 font-medium mb-1">⚠️ 不适用场景</p>
                  <ul className="text-xs text-red-500 space-y-0.5">
                    {tool.not_for.map(n => (
                      <li key={n}>· {n}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
                <h3 className="font-semibold text-[#2d2a26] mb-4">
                  先选择孩子所处的阶段
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {ALL_STAGES.filter(s => tool.applicable_stages.includes(s)).map(stage => (
                    <button
                      key={stage}
                      onClick={() => setChildStage(stage)}
                      className={`p-3 rounded-xl text-sm transition-all text-center ${
                        childStage === stage
                          ? "bg-[#c4753f] text-white font-medium shadow-sm"
                          : "bg-[#faf8f5] border border-[#e8e4df] text-[#2d2a26] hover:border-[#c4753f]"
                      }`}
                    >
                      {STAGE_LABELS[stage]}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#e8f0ec] border border-[#5a7a6a]/20">
                  <p className="text-sm text-[#5a7a6a]">
                    💡 这是一次小实验，不是对孩子的评判。选择权不从孩子手中拿走。
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!childStage}
                className="w-full py-3 rounded-xl bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                开始使用
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* 提问示范入口 */}
              <div className="text-center mt-4">
                <button
                  onClick={() => handleAskStella()}
                  className="text-sm text-[#5a7a6a] hover:text-[#c4753f] transition-colors inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  不确定？先用这个话题问问 Stella 老师
                </button>
              </div>
            </motion.div>
          )}

          {/* Tool Steps */}
          {!isOnStageSelect && !isOnORID && currentStepInfo && (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Step Content */}
              <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#c4753f] bg-[#f5e6d8] px-2 py-0.5 rounded-full">
                    第 {step + 1} 步
                  </span>
                  {currentStepInfo.optional && (
                    <span className="text-xs text-[#9a9590]">（可跳过）</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[#2d2a26] mb-2">
                  {currentStepInfo.title}
                </h2>
                <p className="text-sm text-[#9a9590] mb-6 leading-relaxed">
                  {currentStepInfo.description}
                </p>

                {/* Input Fields */}
                {currentInputs.map(input => (
                  <div key={input.field} className="mb-4">
                    <label className="block text-sm font-medium text-[#2d2a26] mb-2">
                      {input.label}
                      {input.required && <span className="text-red-400 ml-1">*</span>}
                      {input.privacy === "sensitive" && (
                        <span className="text-xs text-[#e88d5a] ml-1">🔒 敏感</span>
                      )}
                    </label>

                    {input.type === "text" && (
                      <textarea
                        value={formData[input.field] || ""}
                        onChange={e => handleInputChange(input.field, e.target.value)}
                        placeholder={input.placeholder || "在这里输入..."}
                        className="w-full h-32 resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20 leading-relaxed"
                      />
                    )}

                    {input.type === "number" && (
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={formData[input.field] ?? ""}
                        onChange={e => handleInputChange(input.field, e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder={input.placeholder || "0"}
                        className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f]"
                      />
                    )}

                    {input.type === "enum" && input.options && (
                      <div className="space-y-2">
                        {input.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleInputChange(input.field, opt)}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-all ${
                              formData[input.field] === opt
                                ? "bg-[#c4753f] text-white font-medium"
                                : "bg-[#faf8f5] border border-[#e8e4df] text-[#2d2a26] hover:border-[#c4753f]"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {input.type === "list" && (
                      <textarea
                        value={formData[input.field] || ""}
                        onChange={e => handleInputChange(input.field, e.target.value)}
                        placeholder={input.placeholder || "每行一个，或用逗号分隔"}
                        className="w-full h-24 resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f]"
                      />
                    )}

                    {input.type === "datetime" && (
                      <input
                        type="date"
                        value={formData[input.field] || ""}
                        onChange={e => handleInputChange(input.field, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#2d2a26] focus:outline-none focus:border-[#c4753f]"
                      />
                    )}
                  </div>
                ))}

                {/* 话术示范 */}
                {tool.script_examples.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowScript(!showScript)}
                      className="flex items-center gap-1.5 text-xs text-[#c4753f] hover:text-[#a86235] transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      {showScript ? "收起话术示范" : "💡 话术示范"}
                    </button>
                    {showScript && (
                      <div className="mt-2 p-4 rounded-xl bg-[#f5e6d8] border border-[#c4753f]/20">
                        {tool.script_examples.map((s, i) => (
                          <div key={i} className="mb-2 last:mb-0">
                            <p className="text-xs font-medium text-[#c4753f] mb-1">{s.context}</p>
                            <p className="text-sm text-[#2d2a26] italic">"{s.text}"</p>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAskStella(tool.script_examples[0].text)}
                          className="mt-3 text-xs text-[#5a7a6a] hover:text-[#c4753f] transition-colors flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          用这些话术问 Stella
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={step === 0}
                  className="px-5 py-2.5 rounded-xl text-sm text-[#9a9590] hover:text-[#2d2a26] border border-[#e8e4df] hover:border-[#2d2a26] transition-colors disabled:opacity-30 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一步
                </button>

                <div className="flex items-center gap-2">
                  {currentStepInfo.optional && (
                    <button
                      onClick={handleSkip}
                      className="px-4 py-2.5 rounded-xl text-sm text-[#9a9590] hover:text-[#2d2a26] border border-[#e8e4df] hover:border-[#2d2a26] transition-colors flex items-center gap-1"
                    >
                      <SkipForward className="w-4 h-4" />
                      跳过
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-[#c4753f] text-white text-sm font-medium hover:bg-[#a86235] transition-colors flex items-center gap-1"
                  >
                    {step < totalSteps - 1 ? "下一步" : "完成填写"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 退出提示 */}
              <p className="text-center text-xs text-[#9a9590] mt-4">
                当前进度已自动保存 ·{" "}
                <Link href="/tools" className="text-[#5a7a6a] hover:underline">退出</Link>
              </p>
            </motion.div>
          )}

          {/* ORID Review */}
          {isOnORID && (
            <motion.div
              key="orid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-[#5a7a6a] mx-auto mb-3" />
                <h2 className="text-xl font-bold text-[#2d2a26] mb-1">填写完成！来做一次轻量反思</h2>
                <p className="text-sm text-[#9a9590]">以下四个问题只需要简短回答，不必写长篇</p>
              </div>

              {/* ORID 四栏 */}
              <div className="space-y-3 mb-6">
                {[
                  { key: "O", label: "O 客观事实", icon: "👁️", guide: tool.orid.O, bg: "#f5f0eb" },
                  { key: "R", label: "R 感受反应", icon: "💭", guide: tool.orid.R, bg: "#f0ece7" },
                  { key: "I", label: "I 意义认识", icon: "🔍", guide: tool.orid.I, bg: "#e8f0ec" },
                  { key: "D", label: "D 行动决定", icon: "🎯", guide: tool.orid.D, bg: "#f5e6d8" },
                ].map(({ key, label, icon, guide, bg }) => (
                  <div key={key} className="p-4 rounded-xl" style={{ backgroundColor: bg }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{icon}</span>
                      <span className="text-sm font-medium text-[#2d2a26]">{label}</span>
                    </div>
                    <p className="text-xs text-[#9a9590] mb-2">{guide}</p>
                    <textarea
                      value={oridData[key] || ""}
                      onChange={e => {
                        setOridData(prev => ({ ...prev, [key]: e.target.value }));
                        checkCrisis(e.target.value);
                      }}
                      placeholder="一句话即可..."
                      className="w-full mt-1 bg-white/50 rounded-lg p-3 text-sm text-[#2d2a26] placeholder:text-[#9a9590] resize-none focus:outline-none focus:ring-1 focus:ring-[#c4753f]/20 min-h-[60px]"
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              {/* 图谱字段预览 + 可见性 */}
              <div className="bg-white rounded-xl border border-[#e8e4df] p-4 mb-6">
                <h4 className="text-sm font-medium text-[#2d2a26] mb-2">
                  📋 将写入成长图谱的字段
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tool.growth_map_fields.map(f => (
                    <span key={f} className="px-2 py-0.5 rounded-md bg-[#e8f0ec] text-[#5a7a6a] text-xs">
                      {f}
                    </span>
                  ))}
                </div>

                {/* 可见性 */}
                <label className="text-xs text-[#9a9590] mb-2 block">记录可见范围</label>
                <div className="flex items-center gap-1 bg-[#f5f0eb] rounded-xl p-1">
                  {([
                    { v: "private" as const, label: "仅自己", icon: EyeOff },
                    { v: "shared-with-stella" as const, label: "Stella可见", icon: Eye },
                    { v: "public" as const, label: "公开", icon: null },
                  ]).map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
                        visibility === v
                          ? "bg-white shadow-sm text-[#2d2a26] font-medium"
                          : "text-[#9a9590] hover:text-[#2d2a26]"
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {v === "public" && "🌐 "}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  className="flex-1 py-3 rounded-xl text-sm text-[#9a9590] border border-[#e8e4df] hover:border-[#2d2a26] transition-colors"
                >
                  返回修改
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[2] py-3 rounded-xl bg-[#5a7a6a] text-white font-medium hover:bg-[#4a6a5a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
                  ) : (
                    <><Save className="w-4 h-4" />保存并汇入成长图谱</>
                  )}
                </button>
              </div>

              {/* 提问示范入口 */}
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    const summary = [
                      `我用「${tool.name}」做了一次练习`,
                      childStage ? `孩子处于${childStage}阶段` : "",
                      oridData.O ? `客观事实：${oridData.O.slice(0, 50)}` : "",
                      oridData.D ? `我决定：${oridData.D.slice(0, 50)}` : "",
                    ].filter(Boolean).join("。");
                    handleAskStella(summary + "，想听听你的建议。");
                  }}
                  className="text-sm text-[#5a7a6a] hover:text-[#c4753f] transition-colors inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  基于结果去问问 Stella 老师
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
