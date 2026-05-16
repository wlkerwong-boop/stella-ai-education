"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, IceCream, Save, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { getCurrentStudent, saveToolRecord } from "@/lib/tools-storage";

const LAYERS = [
  {
    key: "behavior",
    title: "行为 · 水面之上",
    icon: "🌊",
    desc: "孩子做了什么？我做了什么？请像一个旁观者一样客观描述。",
    placeholder: "今天放学后，孩子回到家就把自己关在房间里，我叫他出来吃饭，他说'不饿'...",
  },
  {
    key: "coping",
    title: "应对方式",
    icon: "🛡️",
    desc: "我当时是怎么应对的？",
    placeholder: "我一开始耐着性子劝他，后来语气越来越重，最后忍不住说了句重话...",
    hint: "常见应对姿态：指责 / 讨好 / 超理智 / 打岔 / 一致性表达",
  },
  {
    key: "feelings",
    title: "感受",
    icon: "💗",
    desc: "我当时有什么感受？这个感受在身体的哪个部位？",
    placeholder: "我很着急，觉得他越来越不听话了。胸口闷闷的，肩膀很紧...",
  },
  {
    key: "beliefs",
    title: "观点 / 信念",
    icon: "🧠",
    desc: "我对自己、对孩子、对这件事有什么看法？这个想法是从哪里来的？",
    placeholder: "我觉得他不该这样对我，我辛苦工作一天回来还要操心他的事。孩子就应该听父母的话...",
  },
  {
    key: "expectations",
    title: "期待",
    icon: "🎯",
    desc: "我期待孩子怎么做？我期待自己怎么做？",
    placeholder: "我希望他能主动跟我聊聊学校的事，我希望自己能更有耐心...",
  },
  {
    key: "yearnings",
    title: "渴望 · 深层需求",
    icon: "💎",
    desc: "在这个情境下，我最需要的是什么？被理解？被尊重？被爱？",
    placeholder: "我真正渴望的是被尊重、被看到我的付出。孩子的深层渴望可能是被理解、被信任...",
  },
  {
    key: "insight",
    title: "觉察与反思",
    icon: "✨",
    desc: "填完以上各层后，你有什么新的觉察？如果重新来一次，你会有什么不同？",
    placeholder: "写完这些才意识到，表面上是我和孩子之间的问题，其实是我自己也需要被看见...",
  },
];

export default function IcebergPage() {
  const router = useRouter();
  const user = getCurrentStudent();

  const [content, setContent] = useState<Record<string, string>>({});
  const [currentLayer, setCurrentLayer] = useState(0);
  const [visibility, setVisibility] = useState<"private" | "shared-with-stella">("private");
  const [title, setTitle] = useState("");
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
      toolType: "iceberg",
      title: title || `冰山觉察 · ${new Date().toLocaleDateString("zh-CN")}`,
      content,
      visibility,
      tags: ["iceberg"],
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/tools"), 1500);
    }, 500);
  };

  const totalLayers = LAYERS.length;
  const filledCount = LAYERS.filter((l) => content[l.key]?.trim()).length;
  const isComplete = filledCount >= totalLayers;

  if (saved) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#e8f0ec] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#5a7a6a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">冰山觉察已保存！</h2>
          <p className="text-[#9a9590]">看见冰山，就是改变的开始</p>
        </motion.div>
      </div>
    );
  }

  const layer = LAYERS[currentLayer];

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回工具台</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#5a7a6a] flex items-center justify-center">
              <IceCream className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-[#2d2a26]">冰山觉察日记</span>
          </div>
          <div />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {LAYERS.map((l, i) => (
            <button
              key={l.key}
              onClick={() => setCurrentLayer(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                i === currentLayer
                  ? "bg-[#5a7a6a] text-white scale-110"
                  : content[l.key]?.trim()
                  ? "bg-[#e8f0ec] text-[#5a7a6a]"
                  : "bg-[#e8e4df] text-[#9a9590]"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <span className="text-xs text-[#9a9590] ml-2">
            {filledCount}/{totalLayers}
          </span>
        </div>

        {/* Layer content */}
        <motion.div key={layer.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{layer.icon}</span>
            <h2 className="text-xl font-bold text-[#2d2a26]">{layer.title}</h2>
          </div>
          <p className="text-sm text-[#9a9590] mb-2">{layer.desc}</p>
          {layer.hint && (
            <p className="text-xs text-[#5a7a6a] italic mb-4">💡 {layer.hint}</p>
          )}

          <textarea
            value={content[layer.key] || ""}
            onChange={(e) => setContent((prev) => ({ ...prev, [layer.key]: e.target.value }))}
            placeholder={layer.placeholder}
            className="w-full h-40 resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] p-4 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#5a7a6a] focus:ring-1 focus:ring-[#5a7a6a]/20 leading-relaxed"
          />
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentLayer((s) => Math.max(0, s - 1))}
            disabled={currentLayer === 0}
            className="px-5 py-2.5 rounded-xl text-sm text-[#9a9590] hover:text-[#2d2a26] border border-[#e8e4df] hover:border-[#2d2a26] transition-colors disabled:opacity-30"
          >
            上一层
          </button>

          {currentLayer < totalLayers - 1 ? (
            <button
              onClick={() => setCurrentLayer((s) => Math.min(totalLayers - 1, s + 1))}
              className="px-5 py-2.5 rounded-xl bg-[#5a7a6a] text-white text-sm font-medium hover:bg-[#4a6a5a] transition-colors"
            >
              下一层
            </button>
          ) : (
            <div className="flex items-center gap-3">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5a7a6a] text-white text-sm font-medium hover:bg-[#4a6a5a] transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存日记
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
