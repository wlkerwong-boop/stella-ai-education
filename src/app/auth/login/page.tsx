"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Loader2, LogIn, ArrowLeft, CheckCircle2, XCircle, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState<"code" | "form">("code");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const verifyCode = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setStep("form");
      } else {
        setError(data.message);
      }
    } catch {
      setError("网络错误，请稍后重试");
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("请输入邮箱和密码");
      return;
    }
    if (mode === "new" && !nickname.trim()) {
      setError("请输入昵称");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "new") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, inviteCode: inviteCode.trim().toUpperCase(), nickname }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          setIsLoading(false);
          return;
        }
      }

      // 登录
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      // 保存 session 到 localStorage
      localStorage.setItem("stella_session", JSON.stringify(data.session));
      localStorage.setItem("stella_user", JSON.stringify(data.user));

      setSuccess(`欢迎回来，${data.user.nickname || data.user.email}！`);
      setTimeout(() => router.push("/tools"), 1000);
    } catch {
      setError("操作失败，请稍后重试");
    }
    setIsLoading(false);
  };

  const loginExisting = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("请输入邮箱和密码");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      localStorage.setItem("stella_session", JSON.stringify(data.session));
      localStorage.setItem("stella_user", JSON.stringify(data.user));

      setSuccess(`欢迎回来，${data.user.nickname || data.user.email}！`);
      setTimeout(() => router.push("/tools"), 1000);
    } catch {
      setError("登录失败，请稍后重试");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#9a9590] hover:text-[#2d2a26] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-[#c4753f] flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#2d2a26] mb-2">学员登录</h1>
          <p className="text-sm text-[#9a9590]">
            {mode === "new" ? "新学员请用邀请码注册" : "老学员直接用邮箱登录"}
          </p>
        </div>

        {/* Mode Switch */}
        {step === "code" && (
          <div className="flex gap-2 mb-4 justify-center">
            <button
              onClick={() => setMode("new")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === "new" ? "bg-[#c4753f] text-white" : "bg-[#e8e4df] text-[#9a9590]"
              }`}
            >
              新学员注册
            </button>
            <button
              onClick={() => { setMode("existing"); setStep("form"); }}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#e8e4df] text-[#9a9590] hover:bg-[#d8d4cf] transition-colors"
            >
              老学员登录
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-[#e8f0ec] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#5a7a6a]" />
              </div>
              <p className="text-lg font-medium text-[#2d2a26]">{success}</p>
              <p className="text-sm text-[#9a9590] mt-2">正在进入工具台...</p>
            </motion.div>
          ) : mode === "existing" ? (
            /* 老学员登录 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && loginExisting()}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && loginExisting()}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20"
                  />
                </div>
              </div>
              {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <XCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
              <button
                onClick={loginExisting}
                disabled={!email.trim() || !password.trim() || isLoading}
                className="w-full py-3 rounded-xl bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "登录"}
              </button>
              <p className="text-xs text-center text-[#9a9590]">
                还没有账号？
                <button onClick={() => { setMode("new"); setStep("code"); setError(""); }} className="text-[#c4753f] hover:underline ml-1">
                  用邀请码注册
                </button>
              </p>
            </div>
          ) : step === "code" ? (
            /* 输入邀请码 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">邀请码</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                  placeholder="例如：STELLA-001"
                  className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20"
                  autoFocus
                />
                {error && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-2">
                    <XCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>
              <button
                onClick={verifyCode}
                disabled={!inviteCode.trim() || isLoading}
                className="w-full py-3 rounded-xl bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "验证邀请码"}
              </button>
              <p className="text-xs text-center text-[#9a9590]">
                还没有邀请码？请联系 Stella 老师获取
              </p>
            </div>
          ) : (
            /* 填写注册信息 */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#f5e6d8] text-sm text-[#c4753f]">
                ✅ 邀请码 <strong>{inviteCode}</strong> 验证通过
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">昵称</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => { setNickname(e.target.value); setError(""); }}
                    placeholder="如：小明妈妈、阳光爸爸..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="至少6位密码"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-[#2d2a26] placeholder:text-[#9a9590] focus:outline-none focus:border-[#c4753f] focus:ring-1 focus:ring-[#c4753f]/20"
                  />
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <XCircle className="w-3 h-3" />
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!email.trim() || !password.trim() || !nickname.trim() || isLoading}
                className="w-full py-3 rounded-xl bg-[#5a7a6a] text-white font-medium hover:bg-[#4a6a5a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "注册并进入工具台"}
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-[#9a9590] mt-6">
          Stella教育智囊 · 学员专属工具台
        </p>
      </motion.div>
    </div>
  );
}
