"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Save, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, Wand2 } from "lucide-react";
import { getCurrentStudent, saveToolRecord } from "@/lib/tools-storage";
import VoiceInput from "@/components/VoiceInput";

const GUIDE_QUESTIONS: Record<string, string[]> = {
  objective: [
    "今天上课最触动你的一个点是什么？",
    "你观察到了什么之前没注意到的现象？",
    "孩子/家人做了什么具体的事情？",
  ],
  reflective: [
    "当这件事发生时，你的第一反应是什么？",
    "你感到开心、困惑、焦虑、还是惊喜？",
    "你的身体有什么反应？",
  ],
  interpretive: [
    "这件事情对你意味着什么？",
    "它和你之前的认知有什么关联？",
    "冰山的水面之下发生了什么？",
  ],
  decisional: [
    "基于以上的反思，你接下来决定怎么做？",
    "这个行动打算什么时候开始？",
    "如果迈出最小的第一步，那会是什么？",
  ],
};

const SECTION_LABELS: Record<string, { title: string; icon: string; desc: string }> = {
  objective: { title: "Objective · 客观事实", icon: "👁️", desc: "像摄像机一样记录：发生了什么？" },
  reflective: { title: "Reflective · 感受反应", icon: "💭", desc: "你内心有什么感受？身体有什么反应？" },
  interpretive: { title: "Interpretive · 意义解读", icon: "🔍", desc: "这意味着什么？和课程内容有什么关联？" },
  decisional: { title: "Decisional · 行动决定", icon: "🎯", desc: "你决定怎么做？最小的第一步是什么？" },
};

const ORI_FIELDS = [
  { key: "objective", label: "O 客观事实", icon: "👁️", bg: "bg-[#f5f0eb]" },
  { key: "reflective", label: "R 感受反应", icon: "💭", bg: "bg-[#f0ece7]" },
  { key: "interpretive", label: "I 意义解读", icon: "🔍", bg: "bg-[#e8f0ec]" },
  { key: "decisional", label: "D 行动决定", icon: "🎯", bg: "bg-[#f5e6d8]" },
];

export default function OridPage() {
  const router = useRouter();
  const user = getCurrentStudent();

  const [step, setStep] = useState(0);
  const [content, setContent] = useState({ objective: "", reflective: "", interpretive: "", decisional: "" });
  const [visibility, setVisibility] = useState<"private" | "shared-with-stella" | "public">("shared-with-stella");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (!user) router.push("/auth/login");
  }, [user, router]);

  if (!user) return null;

  const steps = ["objective", "reflective", "interpretive", "decisional"] as const;
  const currentKey = steps[step];
  const isComplete = content.objective && content.reflective && content.interpretive && content.decisional;

  const handleSave = () => {
    setIsSaving(true);
    saveToolRecord({
      userId: user.userId,
      nickname: user.nickname,
      toolType: "orid",
      title: title || `ORID反思 · ${new Date().toLocaleDateString("zh-CN")}`,
      content: { ...content },
      visibility,
      tags: ["orid"],
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/tools"), 1500);
  };

  const handleAiConvert = async () => {
    if (!aiInput.trim() || aiInput.trim().length < 10) { setAiError("请输入至少10个字描述"); return; }
    setAiLoading(true); setAiError("");
    try {
      const res = await fetch("/api/tools/orid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: aiInput }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "转换失败");
      setContent({ objective: data.objective || "", reflective: data.reflective || "", interpretive: data.interpretive || "", decisional: data.decisional || "" });
      setStep(3);
    } catch (err: any) {
      setAiError(err.message || "AI转换失败，请重试");
    } finally { setAiLoading(false); }
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#e8f0ec] flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-[#5a7a6a]" /></div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">反思已保存！</h2>
          <p className="text-[#9a9590]">记录已汇入您的成长图谱</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors"><ArrowLeft className="w-4 h-4" /><span className="text-sm">返回工具台</span></Link>
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-[#c4753f] flex items-center justify-center"><Brain className="w-4 h-4 text-white" /></div><span className="font-medium text-[#2d2a26]">ORID反思模版</span></div>
          <div />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <button onClick={() => { setAiMode(false); setStep(0); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!aiMode ? "bg-[#c4753f] text-white" : "bg-white border border-[#e8e4df] text-[#9a9590]"}`}>分步填写</button>
          <button onClick={() => setAiMode(true)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${aiMode ? "bg-[#c4753f] text-white" : "bg-white border border-[#e8e4df] text-[#9a9590]"}`}><Wand2 className="w-3.5 h-3.5" />AI一键整理</button>
        </div>

        {aiMode ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
            <div className="flex items-center gap-2 mb-3"><Wand2 className="w-5 h-5 text-[#c4753f]" /><h3 className="font-semibold text-[#2d2a26]">AI一键整理</h3><span className="text-xs text-[#9a9590]">说一段话，AI帮你整理成ORID</span></div>
            <p className="text-sm text-[#9a9590] mb-4">你可以随意描述今天发生的事、你的感受和想法，AI会自动整理成结构化的ORID反思。</p>
            <div className="flex items-start gap-2 mb-3">
              <VoiceInput onResult={(text) => setAiInput((prev) => prev + (prev ? " " : "") + text)} />
              <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="例如：今天孩子放学回家就把自己关在房间，我叫他吃饭也不出来。我当时有点生气但也担心..." className="flex-1 h-32 resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f]" />
            </div>
            {aiError && <p className="text-sm text-red-500 mb-3">{aiError}</p>}
            <button onClick={handleAiConvert} disabled={aiLoading || !aiInput.trim()} className="w-full py-3 rounded-xl bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" />AI整理中...</> : <><Sparkles className="w-4 h-4" />一键整理成ORID</>}
            </button>

            {(content.objective || content.reflective || content.interpretive || content.decisional) && (
              <div className="mt-6 space-y-3">
                {ORI_FIELDS.map(({ key, label, icon, bg }) => (
                  <div key={key} className={`p-4 rounded-xl ${bg}`}>
                    <div className="flex items-center gap-2 mb-1"><span>{icon}</span><span className="text-sm font-medium text-[#2d2a26]">{label}</span></div>
                    <textarea value={content[key as keyof typeof content]} onChange={(e) => setContent((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full mt-1 bg-transparent text-sm text-[#2d2a26] resize-none focus:outline-none min-h-[40px]" rows={2} />
                  </div>
                ))}
                <button onClick={handleSave} disabled={!isComplete || isSaving} className="w-full py-3 rounded-xl bg-[#5a7a6a] text-white font-medium hover:bg-[#4a6a5a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}保存反思
                </button>
              </div>
            )}
          </motion.div>
        ) : null}

        {!aiMode && (
          <>
            <div className="flex gap-2 mb-8">
              {steps.map((s, i) => (<div key={s} className={`flex-1 h-2 rounded-full transition-all ${i <= step ? "bg-[#c4753f]" : "bg-[#e8e4df]"}`} />))}
            </div>

            <motion.div key={currentKey} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
              <div className="flex items-center gap-2 mb-1"><span className="text-xl">{SECTION_LABELS[currentKey].icon}</span><h2 className="text-xl font-bold text-[#2d2a26]">{SECTION_LABELS[currentKey].title}</h2></div>
              <p className="text-sm text-[#9a9590] mb-4">{SECTION_LABELS[currentKey].desc}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {GUIDE_QUESTIONS[currentKey].map((q, i) => (
                  <button key={i} onClick={() => { const c = content[currentKey]; setContent((prev) => ({ ...prev, [currentKey]: c ? `${c}\n${q}` : q })); }} className="px-3 py-1.5 rounded-lg bg-white border border-[#e8e4df] text-xs text-[#9a9590] hover:border-[#c4753f] hover:text-[#c4753f] transition-colors text-left">💡 {q}</button>
                ))}
              </div>
              <textarea value={content[currentKey]} onChange={(e) => setContent((prev) => ({ ...prev, [currentKey]: e.target.value }))} placeholder="在这里写下你的反思..." className="w-full h-48 resize-none rounded-2xl border border-[#e8e4df] bg-white p-5 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20 leading-relaxed" />
            </motion.div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="px-5 py-2.5 rounded-xl text-sm text-[#9a9590] hover:text-[#2d2a26] border border-[#e8e4df] hover:border-[#2d2a26] transition-colors disabled:opacity-30">上一步</button>
              {step < 3 ? (
                <button onClick={() => setStep((s) => Math.min(3, s + 1))} className="px-5 py-2.5 rounded-xl bg-[#c4753f] text-white text-sm font-medium hover:bg-[#a86235] transition-colors">下一步</button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-[#f5f0eb] rounded-xl p-1">
                    <button onClick={() => setVisibility("private")} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${visibility === "private" ? "bg-white shadow-sm text-[#9a9590] font-medium" : "text-[#9a9590] hover:text-[#2d2a26]"}`} title="仅自己可见"><EyeOff className="w-3.5 h-3.5 inline mr-1" />仅自己</button>
                    <button onClick={() => setVisibility("shared-with-stella")} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${visibility === "shared-with-stella" ? "bg-white shadow-sm text-[#5a7a6a] font-medium" : "text-[#9a9590] hover:text-[#2d2a26]"}`} title="对Stella老师开放"><Eye className="w-3.5 h-3.5 inline mr-1" />Stella</button>
                    <button onClick={() => setVisibility("public")} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${visibility === "public" ? "bg-white shadow-sm text-[#c4753f] font-medium" : "text-[#9a9590] hover:text-[#2d2a26]"}`} title="对所有人开放">🌐 公开</button>
                  </div>
                  <button onClick={handleSave} disabled={!isComplete || isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5a7a6a] text-white text-sm font-medium hover:bg-[#4a6a5a] transition-colors disabled:opacity-50">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}保存反思</button>
                </div>
              )}
            </div>
            {step === 3 && !title && (
              <div className="mt-6 p-4 rounded-xl bg-white border border-[#e8e4df]">
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">给这次反思起个标题（选填）</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：关于大宝今天不愿写作业的反思" className="w-full px-4 py-2 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f]" />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
