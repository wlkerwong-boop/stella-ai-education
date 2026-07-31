"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  User,
  Bot,
  ArrowLeft,
  Loader2,
  Lightbulb,
  LineChart,
  Plus,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import VoiceInput from "@/components/VoiceInput";
import { WELCOME_MESSAGE, QUICK_QUESTIONS } from "@/lib/prompts";
import {
  getCurrentSession,
  saveCurrentSession,
  startNewSession,
  ChatMessage,
} from "@/lib/storage";
import { getQuotaSummary, recordQuotaUsage } from "@/lib/quota";
import { logUsage } from "@/lib/usage-log";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

/** 剥离不可见 ORID 标记块，防止系统字段泄露给用户 */
function stripOridBlock(text: string): string {
  return text.replace(/<!--\s*ORID[\s\S]*?-->/g, "").trim();
}

// 轻量Markdown渲染组件
function SimpleMarkdown({ content }: { content: string }) {
  // P3-7: 渲染层剥离 ORID，messages 保留原始 content
  const clean = stripOridBlock(content);
  const lines = clean.split("\n");
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-bold text-base mt-3 mb-1 text-[#2d2a26]">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-bold text-lg mt-4 mb-2 text-[#2d2a26]">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="font-bold text-xl mt-4 mb-2 text-[#2d2a26]">
          {renderInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-[#2d2a26]">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "---") {
      elements.push(<hr key={i} className="my-3 border-[#e8e4df]" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="mb-1 text-[#2d2a26]">
          {renderInline(line)}
        </p>
      );
    }
  }

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactElement {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleNewSession = () => {
    startNewSession();
    setMessages([
      { role: "assistant", content: WELCOME_MESSAGE, timestamp: Date.now() },
    ]);
    setShowQuickQuestions(true);
    setInput("");
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 加载本地存储的会话
  useEffect(() => {
    const saved = getCurrentSession();
    if (saved && saved.messages.length > 0) {
      setMessages(
        saved.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }))
      );
      setShowQuickQuestions(false);
    }

    // 处理来自工具台的「提问示范」预设 prompt（?prompt=xxx）
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const preset = params.get("prompt");
      if (preset && !saved) {
        // 只有新对话（无已保存会话）时才自动填入
        const decoded = decodeURIComponent(preset);
        setInput(decoded);
        setShowQuickQuestions(false);
        // 不自动发送，让用户确认后再发
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 保存到本地存储
  useEffect(() => {
    if (messages.length > 1) {
      const chatMessages: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || Date.now(),
      }));
      saveCurrentSession(chatMessages);
    }
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickQuestions(false);

    // G2 配额：读取当前用量，传给服务器检查
    const quotaSummary = getQuotaSummary("anonymous");
    const quotaUsage = { daily: quotaSummary.dailyUsed, monthly: quotaSummary.monthlyUsed };

    try {
      const requestStart = Date.now();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: "anonymous",
          quotaUsage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `请求失败 (${response.status})`;
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // P3-7: messages 保留原始 content（含 ORID 块），渲染层剥离
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || "", timestamp: Date.now() },
      ]);

      // G2 配额：调用成功后增加计数
      recordQuotaUsage("anonymous");

      // G3 usage 日志：记录本次调用的元数据
      if (data.usage) {
        logUsage({
          timestamp: Date.now(),
          userId: "anonymous",
          tier: data.usage.tier || "free",
          model: data.usage.model || "",
          promptTokens: data.usage.promptTokens || 0,
          completionTokens: data.usage.completionTokens || 0,
          totalTokens: data.usage.totalTokens || 0,
          latencyMs: Date.now() - requestStart,
          mode: data.usage.mode || "unknown",
          crisisChecked: data.usage.crisisChecked || false,
          crisisTriggered: data.usage.crisisTriggered || false,
          userMessageLength: text.length,
          quotaRemainingDaily: data.quota?.dailyRemaining ?? -1,
          quotaRemainingMonthly: data.quota?.monthlyRemaining ?? -1,
          success: true,
        });
      }
    } catch (err: any) {
      const errorMsg = err?.message || "网络请求失败";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `抱歉，遇到了一些问题：${errorMsg}。请稍后重试，或刷新页面后再试。`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <Navbar />
      {/* Chat Header */}
      <header className="bg-white border-b border-[#e8e4df]">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#c4753f] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-[#2d2a26] text-sm">Stella老师</span>
            <span className="px-2 py-0.5 rounded-full bg-[#e8f0ec] text-[#5a7a6a] text-xs">在线</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1.5 text-sm text-[#5a7a6a] hover:text-[#c4753f] transition-colors"
              title="开始新对话"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新对话</span>
            </button>
            <Link
              href="/growth"
              className="flex items-center gap-1.5 text-sm text-[#5a7a6a] hover:text-[#2d2a26] transition-colors"
            >
              <LineChart className="w-4 h-4" />
              <span className="hidden sm:inline">成长图谱</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 注册引导提示：对话超过2条后显示 */}
      {messages.length > 3 && (
        <div className="bg-gradient-to-r from-[#f5e6d8] to-[#faf8f5] border-b border-[#e8e4df]">
          <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-[#7a6a5a]">
              💡 您的对话记录已保存在本地。注册后可在成长图谱中保留所有对话记录。
            </p>
            <Link
              href="/auth/login"
              className="text-xs text-[#c4753f] font-medium hover:underline shrink-0 ml-2"
            >
              注册 →
            </Link>
          </div>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-[#5a7a6a]"
                    : "bg-[#c4753f]"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#5a7a6a] text-white"
                    : "bg-white border border-[#e8e4df] text-[#2d2a26]"
                }`}
              >
                {message.role === "user" ? (
                  message.content.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < message.content.split("\n").length - 1 && <br />}
                    </span>
                  ))
                ) : (
                  <SimpleMarkdown content={message.content} />
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#c4753f] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-[#e8e4df] rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#c4753f] typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-[#c4753f] typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-[#c4753f] typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick questions */}
          <AnimatePresence>
            {showQuickQuestions && messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="ml-11"
              >
                <div className="flex items-center gap-2 mb-3 text-xs text-[#9a9590]">
                  <Lightbulb className="w-3 h-3" />
                  您可以试试这样问：
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSubmit(q)}
                      className="px-3 py-2 rounded-lg bg-white border border-[#e8e4df] text-sm text-[#2d2a26] hover:border-[#c4753f] hover:text-[#c4753f] transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="border-t border-[#e8e4df] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3">
            <VoiceInput
              onResult={(text) => {
                setInput((prev) => prev + (prev ? " " : "") + text);
              }}
              size="md"
            />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述您的教育困惑，Stella老师会为您分析..."
              className="flex-1 resize-none rounded-xl border border-[#e8e4df] bg-[#faf8f5] px-4 py-3 text-sm text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20 min-h-[44px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#c4753f] text-white flex items-center justify-center hover:bg-[#a86235] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-[#9a9590] mt-2 text-center">
            AI回答仅供参考，涉及严重心理健康问题请咨询专业人士
          </p>
        </div>
      </div>
    </div>
  );
}
