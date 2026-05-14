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
import { WELCOME_MESSAGE, QUICK_QUESTIONS } from "@/lib/prompts";
import {
  getCurrentSession,
  saveCurrentSession,
  startNewSession,
  ChatMessage,
} from "@/lib/storage";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: "anonymous",
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content, timestamp: Date.now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "抱歉，我暂时遇到了一些问题。请检查API配置是否正确，或者稍后再试。",
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
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-[#2d2a26]">Stella老师</span>
            <span className="px-2 py-0.5 rounded-full bg-[#e8f0ec] text-[#5a7a6a] text-xs">
              在线
            </span>
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
                {message.content.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < message.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
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
