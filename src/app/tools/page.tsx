"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageCircle,
  BookOpen,
  Brain,
  Heart,
  Target,
  Zap,
  Calendar,
  ClipboardList,
  Thermometer,
  IceCream,
  Compass,
  Star,
  BarChart3,
  LogOut,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { getCurrentStudent, logoutStudent, getToolRecordsByUser, getToolStats, ToolRecord } from "@/lib/tools-storage";

const TOOLS = [
  {
    id: "orid" as const,
    name: "ORID反思模版",
    desc: "四步深度反思：客观事实→感受反应→意义解读→行动决定",
    icon: Brain,
    color: "#c4753f",
    bg: "#f5e6d8",
    href: "/tools/orid",
    session: "课后/每日反思",
  },
  {
    id: "emotion" as const,
    name: "情绪温度计",
    desc: "每日记录情绪状态，识别情绪模式，看见成长的轨迹",
    icon: Thermometer,
    color: "#e88d5a",
    bg: "#fce8d8",
    href: "/tools/emotion",
    session: "每日打卡",
  },
  {
    id: "iceberg" as const,
    name: "冰山觉察日记",
    desc: "用冰山模型探索行为背后的内在世界，从表面到深层",
    icon: IceCream,
    color: "#5a7a6a",
    bg: "#e8f0ec",
    href: "/tools/iceberg",
    session: "有情绪触动时",
  },
  {
    id: "action-card" as const,
    name: "知行合一践行卡",
    desc: "每周一个小行动，把课堂所学真正活出来",
    icon: Compass,
    color: "#8b7355",
    bg: "#f0ebe4",
    href: "/tools/action-card",
    session: "每周践行",
  },
  {
    id: "character" as const,
    name: "5C品格自测",
    desc: "从品格、能力、关怀、连接、信心五个维度审视自己的成长",
    icon: Star,
    color: "#6b8f7a",
    bg: "#e0f0e8",
    href: "/tools/character",
    session: "每月自测",
  },
];

export default function ToolsPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentStudent());
  const [records, setRecords] = useState<ToolRecord[]>([]);
  const [stats, setStats] = useState({ totalRecords: 0, byType: {} as Record<string, number> });

  useEffect(() => {
    const currentUser = getCurrentStudent();
    setUser(currentUser);
    if (currentUser) {
      const userRecords = getToolRecordsByUser(currentUser.userId);
      setRecords(userRecords.slice(0, 10));
      setStats(getToolStats(currentUser.userId));
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#f5e6d8] flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-[#c4753f]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-3">学员工具台</h2>
          <p className="text-[#9a9590] mb-8 leading-relaxed">
            这里是Stella老师的学员专属空间。
            使用课程中的工具进行反思和练习，所有记录自动汇入成长图谱。
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            使用邀请码登录
          </Link>
          <p className="text-xs text-[#9a9590] mt-4">
            还没有邀请码？请联系 Stella 老师获取
          </p>
        </motion.div>
      </div>
    );
  }

  const handleLogout = () => {
    logoutStudent();
    setUser(null);
    setRecords([]);
    setStats({ totalRecords: 0, byType: {} });
  };

  const getTypeName = (type: string) => {
    const tool = TOOLS.find((t) => t.id === type);
    return tool?.name || type;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#c4753f] flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-[#2d2a26]">学员工具台</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9a9590] hidden sm:inline">{user.nickname}</span>
            <Link
              href="/growth"
              className="flex items-center gap-1.5 text-sm text-[#5a7a6a] hover:text-[#2d2a26] transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">成长图谱</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* User Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-[#2d2a26]">
              你好，{user.nickname} 👋
            </h1>
            <p className="text-sm text-[#9a9590] mt-1">
              今天想用哪个工具来记录和反思？
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-lg font-bold text-[#c4753f]">{stats.totalRecords}</div>
              <div className="text-xs text-[#9a9590]">累计记录</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-[#9a9590] hover:text-red-500 hover:bg-red-50 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Tool Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {TOOLS.map((tool, i) => {
            const count = stats.byType[tool.id] || 0;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={tool.href}
                  className="block group"
                >
                  <div className="p-6 rounded-2xl bg-white border border-[#e8e4df] hover:shadow-lg hover:border-[#c4753f]/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:scale-110"
                        style={{ backgroundColor: tool.bg }}
                      >
                        <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
                      </div>
                      {count > 0 && (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: tool.bg, color: tool.color }}
                        >
                          已用 {count} 次
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-[#2d2a26] mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-[#9a9590] leading-relaxed mb-3">
                      {tool.desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-[#5a7a6a]">
                      <Calendar className="w-3 h-3" />
                      {tool.session}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Records */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#c4753f]" />
              <h3 className="font-semibold text-[#2d2a26]">最近记录</h3>
            </div>
            <div className="space-y-3">
              {records.map((record) => {
                const tool = TOOLS.find((t) => t.id === record.toolType);
                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-white border border-[#e8e4df] hover:border-[#c4753f]/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: tool?.bg || "#f5e6d8" }}
                        >
                          {tool && <tool.icon className="w-4 h-4" style={{ color: tool.color }} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#2d2a26] truncate">
                            {record.title}
                          </div>
                          <div className="text-xs text-[#9a9590]">
                            {tool?.name} · {formatDate(record.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {record.visibility === "shared-with-stella" ? (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#e8f0ec] text-[#5a7a6a] text-xs">
                            <Eye className="w-3 h-3" />
                            Stella可见
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#f5f0eb] text-[#9a9590] text-xs">
                            <EyeOff className="w-3 h-3" />
                            仅自己
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-4">
              <Link
                href="/growth"
                className="text-sm text-[#5a7a6a] hover:text-[#2d2a26] transition-colors"
              >
                查看完整成长图谱 →
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
