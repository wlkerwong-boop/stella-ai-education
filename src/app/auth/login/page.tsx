"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Loader2, LogIn, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { registerStudent, apiVerifyInviteCode } from "@/lib/tools-storage";

export default function LoginPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState<"code" | "nickname">("code");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyCode = async () => {
    setError("");
    setIsLoading(true);
    const result = await apiVerifyInviteCode(inviteCode);
    setIsLoading(false);

    if (result.valid) {
      setStep("nickname");
    } else {
      setError(result.message);
    }
  };

  const handleRegister = async () => {
    if (!nickname.trim()) {
      setError("请输入您的昵称");
      return;
    }
    setError("");
    setIsLoading(true);

    // 延迟一下让用户看到成功动画
    setTimeout(() => {
      const user = registerStudent(inviteCode, nickname);
      if (user) {
        setSuccess(`欢迎，${nickname}！`);
        setTimeout(() => {
          router.push("/tools");
        }, 1500);
      } else {
        setError("注册失败，请重试");
      }
      setIsLoading(false);
    }, 800);
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
            {step === "code"
              ? "请输入您的课程邀请码"
              : "给自己取个名字吧"}
          </p>
        </div>

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
          ) : step === "code" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">
                  邀请码
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
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
                onClick={handleVerifyCode}
                disabled={!inviteCode.trim() || isLoading}
                className="w-full py-3 rounded-xl bg-[#c4753f] text-white font-medium hover:bg-[#a86235] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "验证邀请码"
                )}
              </button>
              <p className="text-xs text-center text-[#9a9590]">
                还没有邀请码？请联系 Stella 老师获取
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#f5e6d8] text-sm text-[#c4753f] mb-2">
                ✅ 邀请码 <strong>{inviteCode}</strong> 验证通过
              </div>
              <button
                onClick={() => setStep("code")}
                className="text-xs text-[#9a9590] hover:text-[#2d2a26] transition-colors"
              >
                ← 换一个邀请码
              </button>
              <div>
                <label className="block text-sm font-medium text-[#2d2a26] mb-2">
                  您的昵称
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  placeholder="如：小明妈妈、阳光爸爸..."
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
                onClick={handleRegister}
                disabled={!nickname.trim() || isLoading}
                className="w-full py-3 rounded-xl bg-[#5a7a6a] text-white font-medium hover:bg-[#4a6a5a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "进入工具台"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-[#9a9590] mt-6">
          Stella教育智囊 · 学员专属工具台
        </p>
      </motion.div>
    </div>
  );
}
