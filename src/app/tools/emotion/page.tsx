"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Thermometer, Save, Eye, EyeOff, Heart, Loader2, CheckCircle2 } from "lucide-react";
import { getCurrentStudent, saveToolRecord, getEmotionHistory } from "@/lib/tools-storage";

const EMOTIONS = [
  { label: "平静", icon: "😌", color: "#5a7a6a" },
  { label: "喜悦", icon: "😊", color: "#e8a84c" },
  { label: "感恩", icon: "🙏", color: "#c4753f" },
  { label: "满足", icon: "😌", color: "#8b7355" },
  { label: "兴奋", icon: "🤩", color: "#e88d5a" },
  { label: "焦虑", icon: "😰", color: "#a86235" },
  { label: "疲惫", icon: "😩", color: "#9a9590" },
  { label: "愤怒", icon: "😤", color: "#c44f4f" },
  { label: "悲伤", icon: "😢", color: "#6b7a9a" },
  { label: "困惑", icon: "🤔", color: "#7a8a6a" },
];

export default function EmotionPage() {
  const router = useRouter();
  const user = getCurrentStudent();

  const [score, setScore] = useState(5);
  const [emotion, setEmotion] = useState("");
  const [trigger, setTrigger] = useState("");
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<"private" | "shared-with-stella">("private");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<{ date: string; score: number; emotion: string }[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setHistory(getEmotionHistory(user.userId, 7));
  }, [user, router]);

  if (!user) return null;

  const handleSave = () => {
    if (!emotion) return;
    setIsSaving(true);
    saveToolRecord({
      userId: user.userId,
      nickname: user.nickname,
      toolType: "emotion",
      title: `情绪打卡 · ${new Date().toLocaleDateString("zh-CN")}`,
      content: {
        date: new Date().toISOString().slice(0, 10),
        score,
        emotion,
        trigger,
        note,
      },
      visibility,
      tags: ["emotion"],
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/tools"), 1500);
    }, 500);
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#e8f0ec] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#5a7a6a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">今日情绪已记录！</h2>
          <p className="text-[#9a9590]">你的每一次觉察都是成长</p>
        </motion.div>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回工具台</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#e88d5a] flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-[#2d2a26]">情绪温度计</span>
          </div>
          <div />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Date */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <p className="text-sm text-[#9a9590]">{todayStr}</p>
          <h1 className="text-2xl font-bold text-[#2d2a26] mt-1">今天感觉怎么样？</h1>
        </motion.div>

        {/* Score selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-[#e88d5a]" />
            <h3 className="font-semibold text-[#2d2a26]">情绪温度</h3>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#9a9590]">低</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                  score === n
                    ? "bg-[#e88d5a] text-white scale-110 shadow-md"
                    : "bg-[#faf8f5] text-[#9a9590] hover:bg-[#fce8d8]"
                }`}
              >
                {n}
              </button>
            ))}
            <span className="text-xs text-[#9a9590]">高</span>
          </div>
        </motion.div>

        {/* Emotion selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💙</span>
            <h3 className="font-semibold text-[#2d2a26">主要情绪</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {EMOTIONS.map((e) => (
                <button
                  key={e.label}
                  onClick={() => setEmotion(e.label)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    emotion === e.label
                      ? "scale-105 shadow-md"
                      : "bg-[#faf8f5] hover:bg-[#f5f0eb]"
                  }`}
                  style={{
                    backgroundColor: emotion === e.label ? e.color + "20" : undefined,
                    boxShadow: emotion === e.label ? `0 0 0 2px ${e.color}` : undefined,
                  }}
              >
                <div className="text-2xl mb-1">{e.icon}</div>
                <div className="text-xs" style={{ color: emotion === e.label ? e.color : "#9a9590" }}>
                  {e.label}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Trigger & Note */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2d2a26] mb-2">
                触发事件（选填）
              </label>
              <input
                type="text"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="今天发生了什么影响你情绪的事？"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#e88d5a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d2a26] mb-2">
                随想笔记（选填）
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="想记录的其他感受..."
                rows={3}
                className="w-full resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#e88d5a]"
              />
            </div>
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
              <><EyeOff className="w-3.5 h-3.5" /> 仅自己可见</>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={!emotion || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e88d5a] text-white text-sm font-medium hover:bg-[#d07a4a] transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存记录
          </button>
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8">
            <h3 className="font-semibold text-[#2d2a26] mb-3">最近7天的情绪</h3>
            <div className="flex gap-2">
              {history.map((h, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="text-xs text-[#9a9590] mb-1">{h.date.slice(5)}</div>
                  <div
                    className="rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      height: `${h.score * 8 + 20}px`,
                      backgroundColor: `hsl(${h.score * 25}, 60%, ${50 - h.score * 2}%)`,
                      minHeight: "28px",
                    }}
                  >
                    {h.score}
                  </div>
                  <div className="text-xs text-[#9a9590] mt-1">{h.emotion}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
