"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Brain,
  Heart,
  Target,
  Zap,
  Calendar,
  BarChart3,
  Loader2,
  BookOpen,
  ClipboardList,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  getAllSessions,
  getUserStats,
  ChatSession,
} from "@/lib/storage";
import {
  getToolRecordsByUser,
  getToolStats,
  getEmotionHistory,
  ToolRecord,
  getCurrentStudent,
} from "@/lib/tools-storage";
import {
  getToolUsageByUser,
  getToolUsageStats,
  type ToolUsageRecord,
} from "@/lib/tool-usage-storage";
import { getToolById } from "@/lib/tool-definitions";

interface AnalysisResult {
  analysis: string;
  stage: string;
}

const STAGES = [
  { name: "觉醒期", desc: "意识到问题，开始寻求答案", color: "#e8c4a0" },
  { name: "探索期", desc: "学习新工具和方法，尝试应用", color: "#c4753f" },
  { name: "践行期", desc: "将理念转化为日常行动", color: "#5a7a6a" },
  { name: "内化期", desc: "新的思维方式成为自然反应", color: "#8b7355" },
];

export default function GrowthPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalConversations: 0,
    firstChatDate: null as number | null,
    latestChatDate: null as number | null,
  });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [toolRecords, setToolRecords] = useState<ToolRecord[]>([]);
  const [toolStats, setToolStats] = useState({ totalRecords: 0, byType: {} as Record<string, number> });
  const [usageRecords, setUsageRecords] = useState<ToolUsageRecord[]>([]);
  const [usageStats, setUsageStats] = useState({ totalRecords: 0, byTool: {} as Record<string, number> });

  useEffect(() => {
    const allSessions = getAllSessions();
    setSessions(allSessions);
    setStats(getUserStats());

    // 根据对话数量简单判定阶段（后期可用AI分析）
    const totalQ = getUserStats().totalQuestions;
    if (totalQ >= 20) setCurrentStage(3);
    else if (totalQ >= 10) setCurrentStage(2);
    else if (totalQ >= 3) setCurrentStage(1);
    else setCurrentStage(0);

    // 加载工具记录
    const student = getCurrentStudent();
    if (student) {
      const records = getToolRecordsByUser(student.userId);
      setToolRecords(records.slice(0, 5));
      setToolStats(getToolStats(student.userId));

      // 加载新工具使用记录
      const usageRecs = getToolUsageByUser(student.userId);
      setUsageRecords(usageRecs.slice(0, 5));
      setUsageStats(getToolUsageStats(student.userId));
    }
  }, []);

  const generateAnalysis = async () => {
    if (sessions.length === 0) return;

    setIsLoading(true);
    try {
      // 收集所有对话消息
      const allMessages = sessions.flatMap((s) =>
        s.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }))
      );

      const response = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);

        // 尝试从分析结果中提取阶段信息
        if (data.analysis.includes("内化期")) setCurrentStage(3);
        else if (data.analysis.includes("践行期")) setCurrentStage(2);
        else if (data.analysis.includes("探索期")) setCurrentStage(1);
        else if (data.analysis.includes("觉醒期")) setCurrentStage(0);
      }
    } catch (error) {
      console.error("分析失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  const learningDays = stats.firstChatDate
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - stats.firstChatDate) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#e8f0ec] flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-[#5a7a6a]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2d2a26] mb-3">
              您的成长图谱
            </h2>
            <p className="text-[#9a9590] max-w-md mx-auto mb-8 leading-relaxed">
              当您与Stella老师进行对话后，这里会自动记录您的教育认知成长轨迹。
              从"问题导向"到"系统思维"，看见自己的每一步进化。
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              开始第一次对话
            </Link>
          </motion.div>
        ) : (
          <>
            {/* 统计卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
            >
              {[
                {
                  icon: MessageCircle,
                  label: "提问次数",
                  value: stats.totalQuestions,
                  color: "#c4753f",
                  bg: "#f5e6d8",
                },
                {
                  icon: BookOpen,
                  label: "对话次数",
                  value: stats.totalConversations,
                  color: "#5a7a6a",
                  bg: "#e8f0ec",
                },
                {
                  icon: Calendar,
                  label: "学习天数",
                  value: learningDays,
                  color: "#8b7355",
                  bg: "#f0ebe4",
                },
                {
                  icon: ClipboardList,
                  label: "工具记录",
                  value: toolStats.totalRecords + usageStats.totalRecords,
                  color: "#e88d5a",
                  bg: "#fce8d8",
                },
                {
                  icon: Zap,
                  label: "当前阶段",
                  value: STAGES[currentStage].name,
                  color: "#c4753f",
                  bg: "#f5e6d8",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-white border border-[#e8e4df]"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <stat.icon
                      className="w-5 h-5"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <div className="text-2xl font-bold text-[#2d2a26] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#9a9590]">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* 分享按钮 */}
            {stats.totalConversations > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex justify-center mb-8"
              >
                <button
                  onClick={() => {
                    const text = [
                      `🌱 我的教育成长图谱 - Stella教育智囊`,
                      ``,
                      `📊 对话次数：${stats.totalConversations} 次`,
                      `📅 学习天数：${learningDays} 天`,
                      `🛠 工具记录：${toolStats.totalRecords} 条`,
                      `📍 当前阶段：${STAGES[currentStage].name}`,
                      ``,
                      `👇 你也来试试，用系统思维看见教育的整体`,
                      `https://stella-ai-education.vercel.app`,
                    ].join("\n");
                    navigator.clipboard.writeText(text).then(() => {
                      alert("✅ 成长图谱已复制，可以分享到小红书/朋友圈了！");
                    });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#e8e4df] text-sm text-[#5a7a6a] hover:bg-[#f0ece7] hover:border-[#c4753f] hover:text-[#c4753f] transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享成长图谱
                </button>
              </motion.div>
            )}

            {/* 成长阶段可视化 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-[#c4753f]" />
                <h3 className="font-semibold text-[#2d2a26]">成长阶段</h3>
              </div>

              <div className="relative">
                {/* 进度线 */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-[#e8e4df] rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(currentStage / (STAGES.length - 1)) * 100}%`,
                      backgroundColor: STAGES[currentStage].color,
                    }}
                  />
                </div>

                {/* 阶段节点 */}
                <div className="relative flex justify-between">
                  {STAGES.map((stage, i) => (
                    <div key={stage.name} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white ${
                          i <= currentStage
                            ? "border-[#c4753f] shadow-lg shadow-[#c4753f]/20"
                            : "border-[#e8e4df]"
                        }`}
                      >
                        {i <= currentStage ? (
                          <TrendingUp
                            className="w-5 h-5"
                            style={{ color: stage.color }}
                          />
                        ) : (
                          <span className="text-xs text-[#9a9590]">{i + 1}</span>
                        )}
                      </div>
                      <div
                        className={`mt-3 text-center ${
                          i === currentStage
                            ? "font-semibold text-[#2d2a26]"
                            : "text-[#9a9590]"
                        }`}
                      >
                        <div className="text-sm">{stage.name}</div>
                        {i === currentStage && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs mt-1 max-w-[100px]"
                          >
                            {stage.desc}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 生成分析按钮 */}
            {!analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-8"
              >
                <button
                  onClick={generateAnalysis}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5a7a6a] text-white font-medium hover:bg-[#4a6a5a] transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在分析您的成长轨迹...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      生成AI成长分析报告
                    </>
                  )}
                </button>
                <p className="text-xs text-[#9a9590] mt-3">
                  {isLoading
                    ? <>报告生成中，通常需要 20 秒左右，请稍候{/* 请 K3 补审 */}</>
                    : `基于您与Stella老师的${stats.totalQuestions}次问答，AI将为您生成个性化成长分析`
                  }
                </p>
              </motion.div>
            )}

            {/* AI分析报告 */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#e8e4df] p-6 mb-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-[#c4753f]" />
                  <h3 className="font-semibold text-[#2d2a26]">
                    AI成长分析报告
                  </h3>
                </div>
                <div className="prose prose-sm max-w-none text-[#2d2a26]">
                  {analysis.analysis.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h4
                          key={i}
                          className="text-lg font-semibold text-[#2d2a26] mt-6 mb-3"
                        >
                          {line.replace("## ", "")}
                        </h4>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li key={i} className="ml-4 text-sm leading-relaxed">
                          {line.replace("- ", "")}
                        </li>
                      );
                    }
                    if (line.trim() === "") {
                      return <div key={i} className="h-2" />;
                    }
                    return (
                      <p key={i} className="text-sm leading-relaxed mb-2">
                        {line}
                      </p>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-[#e8e4df] flex justify-between items-center">
                  <p className="text-xs text-[#9a9590]">
                    分析时间：{formatDate(Date.now())}
                  </p>
                  <button
                    onClick={generateAnalysis}
                    disabled={isLoading}
                    className="text-sm text-[#5a7a6a] hover:text-[#2d2a26] transition-colors"
                  >
                    {isLoading ? "重新生成中..." : "重新生成"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 最近对话 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-[#e8e4df] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#c4753f]" />
                <h3 className="font-semibold text-[#2d2a26]">最近对话</h3>
              </div>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-[#faf8f5] border border-[#e8e4df] hover:border-[#c4753f]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#2d2a26] text-sm mb-1 truncate">
                          {session.title || "未命名对话"}
                        </div>
                        <div className="text-xs text-[#9a9590]">
                          {session.messages.length}条消息 ·
                          {formatDate(session.updatedAt)}
                        </div>
                      </div>
                      <Link
                        href="/chat"
                        className="text-xs text-[#5a7a6a] hover:text-[#2d2a26] transition-colors flex-shrink-0"
                      >
                        继续
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 工具记录 */}
            {toolRecords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-[#e8e4df] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#e88d5a]" />
                    <h3 className="font-semibold text-[#2d2a26]">最近工具记录</h3>
                  </div>
                  <Link
                    href="/tools"
                    className="text-xs text-[#5a7a6a] hover:text-[#2d2a26] transition-colors"
                  >
                    去工具台 →
                  </Link>
                </div>
                <div className="space-y-3">
                  {toolRecords.map((record) => {
                    const toolIcons: Record<string, string> = {
                      orid: "🧠",
                      emotion: "🌡️",
                      iceberg: "🧊",
                      "action-card": "🧭",
                      character: "⭐",
                    };
                    const toolNames: Record<string, string> = {
                      orid: "ORID反思",
                      emotion: "情绪打卡",
                      iceberg: "冰山日记",
                      "action-card": "践行卡",
                      character: "品格自测",
                    };
                    return (
                      <div
                        key={record.id}
                        className="p-3 rounded-xl bg-[#faf8f5] border border-[#e8e4df] hover:border-[#e88d5a]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg">{toolIcons[record.toolType] || "📋"}</span>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-[#2d2a26] truncate">
                                {record.title}
                              </div>
                              <div className="text-xs text-[#9a9590]">
                                {toolNames[record.toolType] || record.toolType} · {new Date(record.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {record.visibility === "public" ? (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#f5e6d8] text-[#c4753f] text-xs">
                                🌐 公开
                              </span>
                            ) : record.visibility === "shared-with-stella" ? (
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
              </motion.div>
            )}

            {/* 新工具使用记录 */}
            {usageRecords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-white rounded-2xl border border-[#e8e4df] p-6 mt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#c4753f]" />
                    <h3 className="font-semibold text-[#2d2a26]">工具练习记录</h3>
                  </div>
                  <Link
                    href="/tools"
                    className="text-xs text-[#5a7a6a] hover:text-[#2d2a26] transition-colors"
                  >
                    去工具台 →
                  </Link>
                </div>
                <div className="space-y-3">
                  {usageRecords.map((record) => {
                    const tool = getToolById(record.tool_definition_id);
                    const iconEmoji: Record<string, string> = {
                      Map: "🗺️", Star: "⭐", ListChecks: "✅", Footprints: "👣",
                      Gauge: "📊", BookOpen: "📖", RefreshCw: "🔄", Brain: "🧠",
                    };
                    return (
                      <div
                        key={record.id}
                        className="p-3 rounded-xl bg-[#faf8f5] border border-[#e8e4df] hover:border-[#c4753f]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg">
                              {tool ? (iconEmoji[tool.icon] || "📋") : "📋"}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-[#2d2a26] truncate">
                                {tool?.name || record.tool_definition_id}
                              </div>
                              <div className="text-xs text-[#9a9590]">
                                {record.child_stage || "未选阶段"}
                                {record.orid_summary?.O && ` · ${record.orid_summary.O.slice(0, 20)}...`}
                                {" · "}
                                {new Date(record.created_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {record.status === "withdrawn" ? (
                              <span className="px-2 py-1 rounded-md bg-red-50 text-red-400 text-xs">
                                已撤销
                              </span>
                            ) : record.visibility === "public" ? (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#f5e6d8] text-[#c4753f] text-xs">
                                🌐 公开
                              </span>
                            ) : record.visibility === "shared-with-stella" ? (
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
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
