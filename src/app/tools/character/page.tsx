"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Save, Eye, EyeOff, Loader2, CheckCircle2, TrendingUp } from "lucide-react";
import { getCurrentStudent, saveToolRecord, getCharacterHistory } from "@/lib/tools-storage";

const C_DIMENSIONS = [
  {
    key: "character",
    label: "C1 品格 Character",
    icon: "🛡️",
    desc: "我能对自己诚实，对家人有责任感，言行一致",
    prompts: [
      "我能对自己诚实，承认自己的不足",
      "我对家人有责任感，说到做到",
      "我的言行一致，不给孩子双重标准",
    ],
  },
  {
    key: "competence",
    label: "C2 能力 Competence",
    icon: "🔧",
    desc: "我能运用课程工具分析和解决教育问题",
    prompts: [
      "我能运用系统思维分析教育问题",
      "我掌握了冰山对话的基本技巧",
      "我能把课程理念转化为具体行动",
    ],
  },
  {
    key: "caring",
    label: "C3 关怀 Caring",
    icon: "💗",
    desc: "我能真正倾听孩子，关心内心世界",
    prompts: [
      "我能真正倾听孩子的感受而不评判",
      "我关心孩子的内心世界胜过外在表现",
      "我能在孩子遇到困难时给予温暖支持",
    ],
  },
  {
    key: "connection",
    label: "C4 连接 Connection",
    icon: "🤝",
    desc: "我和家人之间有安全、开放的沟通",
    prompts: [
      "我和孩子之间有安全、开放的沟通",
      "我和伴侣在教育方向上有一致性",
      "我能与同频的家长建立支持网络",
    ],
  },
  {
    key: "confidence",
    label: "C5 信心 Confidence",
    icon: "💪",
    desc: "我对自己作为父母的能力有信心",
    prompts: [
      "我对自己作为父母的能力有信心",
      "面对教育挑战时，我相信能找到解决方案",
      "我愿意尝试新方法，即使可能失败",
    ],
  },
];

export default function CharacterPage() {
  const router = useRouter();
  const user = getCurrentStudent();

  const [scores, setScores] = useState<Record<string, number>>({
    character: 5,
    competence: 5,
    caring: 5,
    connection: 5,
    confidence: 5,
  });
  const [reflection, setReflection] = useState("");
  const [growthArea, setGrowthArea] = useState("");
  const [visibility, setVisibility] = useState<"private" | "shared-with-stella">("shared-with-stella");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<{ date: string; scores: Record<string, number> }[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setHistory(getCharacterHistory(user.userId));
  }, [user, router]);

  if (!user) return null;

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const averageScore = (totalScore / 5).toFixed(1);
  const isComplete = Object.values(scores).every((s) => s > 0);

  const handleSave = () => {
    setIsSaving(true);
    saveToolRecord({
      userId: user.userId,
      nickname: user.nickname,
      toolType: "character",
      title: `5C品格自测 · ${new Date().toLocaleDateString("zh-CN")}`,
      content: { scores, reflection, growthArea, date: new Date().toISOString().slice(0, 10) },
      visibility,
      tags: ["character"],
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/tools"), 1500);
    }, 500);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "#c44f4f";
    if (score <= 6) return "#e88d5a";
    return "#5a7a6a";
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#e8f0ec] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#5a7a6a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">自测已保存！</h2>
          <p className="text-[#9a9590]">持续自测，看见品格成长的轨迹</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回工具台</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6b8f7a] flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-[#2d2a26]">5C品格自测</span>
          </div>
          <div />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2d2a26] mb-2">5C品格自测</h1>
          <p className="text-sm text-[#9a9590]">从五个维度审视自己的成长，每月一次，持续看见变化</p>
        </motion.div>

        {/* Current Average */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6 text-center">
          <div className="text-4xl font-bold text-[#5a7a6a]">{averageScore}</div>
          <div className="text-sm text-[#9a9590] mt-1">综合得分 / 10</div>
        </motion.div>

        {/* 5C Scores */}
        <div className="space-y-3 mb-6">
          {C_DIMENSIONS.map((dim, i) => (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-[#e8e4df] p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{dim.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[#2d2a26] text-sm">{dim.label}</h3>
                    <p className="text-xs text-[#9a9590]">{dim.desc}</p>
                  </div>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: getScoreColor(scores[dim.key]) }}
                >
                  {scores[dim.key]}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={scores[dim.key]}
                onChange={(e) =>
                  setScores((prev) => ({ ...prev, [dim.key]: parseInt(e.target.value) }))
                }
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #5a7a6a ${scores[dim.key] * 10}%, #e8e4df ${scores[dim.key] * 10}%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[#9a9590] mt-1">
                <span>1 还需努力</span>
                <span>5 正在路上</span>
                <span>10 已成自然</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reflection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📝</span>
            <h3 className="font-semibold text-[#2d2a26]">自测反思（选填）</h3>
          </div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="做完自测后有什么觉察？哪些地方最让自己意外？"
            rows={3}
            className="w-full resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#6b8f7a] leading-relaxed"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#2d2a26] mb-2">
              最想提升的方面（选填）
            </label>
            <input
              type="text"
              value={growthArea}
              onChange={(e) => setGrowthArea(e.target.value)}
              placeholder="例如：我想在'关怀'方面做得更好，多倾听孩子的感受"
              className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#6b8f7a]"
            />
          </div>
        </motion.div>

        {/* Save */}
        <div className="flex items-center justify-between">
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6b8f7a] text-white text-sm font-medium hover:bg-[#5a7e6a] transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存自测
          </button>
        </div>

        {/* History Chart */}
        {history.length > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#6b8f7a]" />
              <h3 className="font-semibold text-[#2d2a26]">自测变化趋势</h3>
            </div>
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-4 overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {history.map((h, i) => {
                  const avg = Object.values(h.scores).reduce((a, b) => a + b, 0) / 5;
                  return (
                    <div key={i} className="text-center">
                      <div className="text-xs text-[#9a9590] mb-2">{h.date.slice(5)}</div>
                      <div
                        className="w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold mx-auto"
                        style={{
                          height: `${avg * 8 + 20}px`,
                          backgroundColor: getScoreColor(avg),
                          minHeight: "28px",
                        }}
                      >
                        {avg.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
