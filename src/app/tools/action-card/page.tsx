"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Save, Eye, EyeOff, Loader2, CheckCircle2, Target } from "lucide-react";
import { getCurrentStudent, saveToolRecord } from "@/lib/tools-storage";

export default function ActionCardPage() {
  const router = useRouter();
  const user = getCurrentStudent();

  const [knowledge, setKnowledge] = useState("");
  const [action, setAction] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [support, setSupport] = useState("");
  const [reflection, setReflection] = useState("");
  const [visibility, setVisibility] = useState<"private" | "shared-with-stella">("shared-with-stella");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) router.push("/auth/login");
  }, [user, router]);

  if (!user) return null;

  const handleSave = () => {
    setIsSaving(true);
    saveToolRecord({
      userId: user.userId,
      nickname: user.nickname,
      toolType: "action-card",
      title: `践行卡 · ${weeklyGoal || action.slice(0, 20)}`,
      content: { knowledge, action, weeklyGoal, support, reflection, date: new Date().toISOString().slice(0, 10) },
      visibility,
      tags: ["action-card"],
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/tools"), 1500);
    }, 500);
  };

  const isComplete = knowledge && action;

  if (saved) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#e8f0ec] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#5a7a6a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">践行卡已创建！</h2>
          <p className="text-[#9a9590]">从"知道"到"做到"，每一步都算数</p>
        </motion.div>
      </div>
    );
  }

  const weekStr = `第 ${Math.ceil((Date.now() - new Date("2026-05-01").getTime()) / (7 * 86400000))} 周践行`;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回工具台</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#8b7355] flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-[#2d2a26]">知行合一践行卡</span>
          </div>
          <div />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <p className="text-sm text-[#9a9590]">{weekStr}</p>
          <h1 className="text-2xl font-bold text-[#2d2a26] mt-1">本周我决定践行...</h1>
        </motion.div>

        <div className="space-y-4">
          {/* 知 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📖</span>
              <h3 className="font-semibold text-[#2d2a26]">知 · 这周学到的最核心知识点</h3>
            </div>
            <p className="text-xs text-[#9a9590] mb-3">这节课我学到的最重要的一个理念或工具是什么？</p>
            <textarea
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
              placeholder="例如：冰山理论让我明白，孩子的行为只是冰山一角，真正重要的是水面之下的渴望..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#8b7355] leading-relaxed"
            />
          </motion.div>

          {/* 行 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🛤️</span>
              <h3 className="font-semibold text-[#2d2a26]">行 · 我决定践行的行动</h3>
            </div>
            <p className="text-xs text-[#9a9590] mb-3">这个知识如何应用到生活中？具体做什么？</p>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="例如：这周每次孩子有情绪时，我先做一次冰山觉察（自己），再用冰山对话的方式问他..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#8b7355] leading-relaxed"
            />
          </motion.div>

          {/* 周目标 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[#8b7355]" />
              <h3 className="font-semibold text-[#2d2a26]">本周具体目标（选填）</h3>
            </div>
            <input
              type="text"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              placeholder="例如：本周完成3次冰山对话练习"
              className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#8b7355]"
            />
          </motion.div>

          {/* 支持 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤝</span>
              <h3 className="font-semibold text-[#2d2a26]">需要的支持（选填）</h3>
            </div>
            <input
              type="text"
              value={support}
              onChange={(e) => setSupport(e.target.value)}
              placeholder="我需要什么才能完成这个行动？"
              className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#8b7355]"
            />
          </motion.div>

          {/* 反思（践行后填写） */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <h3 className="font-semibold text-[#2d2a26]">践行后的反思（选填，可稍后补充）</h3>
            </div>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="完成了有什么体会？遇到什么困难？下次怎么调整？"
              rows={3}
              className="w-full resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#8b7355] leading-relaxed"
            />
          </motion.div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setVisibility((v) => (v === "private" ? "shared-with-stella" : "private"))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors ${
              visibility === "shared-with-stella"
                ? "bg-[#e8f0ec] text-[#5a7a6a]"
                : "bg-[#f5f0eb] text-[#9a9590]"
            }`}
          >
            {visibility === "shared-with-stella" ? (
              <><Eye className="w-3.5 h-3.5" /> Stella可见</>
            ) : (
              <><EyeOff className="w-3.5 h-3.5" /> 仅自己</>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={!isComplete || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8b7355] text-white text-sm font-medium hover:bg-[#7a6350] transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            创建践行卡
          </button>
        </div>
      </main>
    </div>
  );
}
