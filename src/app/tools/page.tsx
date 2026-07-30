"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageCircle,
  Heart,
  Calendar,
  ClipboardList,
  BarChart3,
  LogOut,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { getCurrentStudent, logoutStudent, getToolRecordsByUser, getToolStats, type ToolRecord } from "@/lib/tools-storage";
import { getApprovedTools, getToolPresetQuestions } from "@/lib/tool-definitions";
import { getToolUsageByUser, getToolUsageStats } from "@/lib/tool-usage-storage";

const ICON_EMOJI: Record<string, string> = {
  Map: "🗺️", Star: "⭐", ListChecks: "✅", Footprints: "👣",
  Gauge: "📊", BookOpen: "📖", RefreshCw: "🔄", Brain: "🧠",
};

export default function ToolsPage() {
  const router = useRouter();
  const tools = getApprovedTools();
  const [user, setUser] = useState(getCurrentStudent());
  const [records, setRecords] = useState<ToolRecord[]>([]);
  const [stats, setStats] = useState({ totalRecords: 0, byType: {} as Record<string, number> });
  const [usageStats, setUsageStats] = useState({ totalRecords: 0, byTool: {} as Record<string, number> });

  useEffect(() => {
    const currentUser = getCurrentStudent();
    setUser(currentUser);
    if (currentUser) {
      const userRecords = getToolRecordsByUser(currentUser.userId);
      setRecords(userRecords.slice(0, 10));
      setStats(getToolStats(currentUser.userId));
      setUsageStats(getToolUsageStats(currentUser.userId));
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

  const handleAskStella = (toolId: string) => {
    const presets = getToolPresetQuestions(toolId);
    const prompt = presets[0] || "我想聊聊关于工具的使用";
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const totalAllRecords = stats.totalRecords + usageStats.totalRecords;

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
              <div className="text-lg font-bold text-[#c4753f]">{totalAllRecords}</div>
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
          {tools.map((tool, i) => {
            const count = usageStats.byTool[tool.tool_id] || 0;
            return (
              <motion.div
                key={tool.tool_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="group relative">
                  <Link
                    href={`/tools/${tool.tool_id}`}
                    className="block"
                  >
                    <div className="p-5 rounded-2xl bg-white border border-[#e8e4df] hover:shadow-lg hover:border-[#c4753f]/20 transition-all">
                      {/* Top Row: Icon + Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                          style={{ backgroundColor: tool.icon_bg }}
                        >
                          {ICON_EMOJI[tool.icon] || "📋"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {count > 0 && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: tool.icon_bg, color: tool.icon_color }}
                            >
                              已用 {count} 次
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-[#f5f0eb] text-[#9a9590] text-xs">
                            {tool.estimated_time}
                          </span>
                        </div>
                      </div>

                      {/* Name + Desc */}
                      <h3 className="text-lg font-semibold text-[#2d2a26] mb-1">
                        {tool.name}
                      </h3>

                      {/* Stages */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tool.applicable_stages.map(s => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md text-xs"
                            style={{ backgroundColor: tool.icon_bg, color: tool.icon_color }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Pain Points */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tool.pain_points.slice(0, 3).map(p => (
                          <span key={p} className="px-2 py-0.5 rounded-full bg-[#f5f0eb] text-[#9a9590] text-xs">
                            {p}
                          </span>
                        ))}
                        {tool.pain_points.length > 3 && (
                          <span className="text-xs text-[#9a9590]">+{tool.pain_points.length - 3}</span>
                        )}
                      </div>

                      {/* Not-for Warning */}
                      {tool.not_for.length > 0 && (
                        <div className="flex items-start gap-1 text-xs text-red-400 mb-3">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{tool.not_for[0]}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* "提问示范"浮动按钮 */}
                  <button
                    onClick={() => handleAskStella(tool.tool_id)}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-[#c4753f] text-white text-xs font-medium hover:bg-[#a86235] flex items-center gap-1 shadow-sm"
                    title="先用这个话题问问 Stella"
                  >
                    <MessageCircle className="w-3 h-3" />
                    提问示范
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Records (legacy + new) */}
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
                const toolNames: Record<string, string> = {
                  orid: "ORID反思", emotion: "情绪打卡", iceberg: "冰山日记",
                  "action-card": "践行卡", character: "品格自测",
                };
                const toolIcons: Record<string, string> = {
                  orid: "🧠", emotion: "🌡️", iceberg: "🧊",
                  "action-card": "🧭", character: "⭐",
                };
                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-white border border-[#e8e4df] hover:border-[#c4753f]/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg">{toolIcons[record.toolType] || "📋"}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#2d2a26] truncate">
                            {record.title}
                          </div>
                          <div className="text-xs text-[#9a9590]">
                            {toolNames[record.toolType] || record.toolType} · {formatDate(record.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {record.visibility === "public" ? (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#f5e6d8] text-[#c4753f] text-xs">🌐 公开</span>
                        ) : record.visibility === "shared-with-stella" ? (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#e8f0ec] text-[#5a7a6a] text-xs">
                            <Eye className="w-3 h-3" />Stella可见
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#f5f0eb] text-[#9a9590] text-xs">
                            <EyeOff className="w-3 h-3" />仅自己
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
