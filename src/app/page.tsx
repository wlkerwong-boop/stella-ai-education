"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  BookOpen,
  Users,
  Brain,
  ArrowRight,
  Sparkles,
  Heart,
  Target,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e8d5c4] bg-[#f5e6d8]/70 backdrop-blur-sm text-[#c4753f] text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              基于20年教育经验的AI智慧伙伴
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[#c4753f] text-white text-[11px] font-semibold tracking-wider">
                FGAOS V4.0
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-[#2d2a26] leading-tight mb-6"
          >
            用系统思维
            <br />
            看见教育的
            <span className="text-[#c4753f]">整体</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#9a9590] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            每个孩子都是独特的系统。Stella老师融合系统思维、冰山理论、品格教育，
            帮助家长跳出"头疼医头"的困境，看见孩子行为背后的深层需求。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/chat"
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#c4753f] to-[#b06a38] text-white font-medium shadow-lg shadow-[#c4753f]/20 hover:-translate-y-0.5 hover:shadow-xl transition-all group"
            >
              <MessageCircle className="w-5 h-5" />
              免费向Stella老师提问
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-[#e8e4df] text-[#2d2a26] font-medium hover:border-[#c4753f] hover:text-[#c4753f] transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              了解课程体系
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#c4753f]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#5a7a6a]/5 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2d2a26] mb-4">
              三大核心服务
            </h2>
            <p className="text-[#9a9590] max-w-xl mx-auto">
              从AI问答到系统学习，再到线下陪伴，构建完整的家庭教育支持体系
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Link href="/chat" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group p-8 rounded-2xl bg-[#faf8f5] border border-[#e8e4df] hover:border-[#c4753f]/30 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f5e6d8] flex items-center justify-center mb-6 group-hover:bg-[#c4753f] transition-colors">
                <Brain className="w-6 h-6 text-[#c4753f] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[#2d2a26] mb-3">
                AI教育问答
              </h3>
              <p className="text-[#9a9590] text-sm leading-relaxed mb-4">
                基于Stella老师20年教育经验，用系统思维回答您的教育困惑。
                青春期沟通、厌学、多子女平衡……每个问题都得到深度分析。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-[#f5e6d8] text-[#c4753f] text-xs">
                  系统思维
                </span>
                <span className="px-2 py-1 rounded-md bg-[#e8f0ec] text-[#5a7a6a] text-xs">
                  冰山理论
                </span>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-[#c4753f] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                进入体验
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
            </Link>

            {/* Feature 2 */}
            <Link href="/growth" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group p-8 rounded-2xl bg-[#faf8f5] border border-[#e8e4df] hover:border-[#5a7a6a]/30 transition-all hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-[#e8f0ec] flex items-center justify-center mb-6 group-hover:bg-[#5a7a6a] transition-colors">
                <Target className="w-6 h-6 text-[#5a7a6a] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[#2d2a26] mb-3">
                思维进化图景
              </h3>
              <p className="text-[#9a9590] text-sm leading-relaxed mb-4">
                记录您的每一次提问和反思，AI自动绘制您的成长轨迹。
                从"问题导向"到"系统思维"，看见自己的教育认知进化。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-[#f5e6d8] text-[#c4753f] text-xs">
                  成长图谱
                </span>
                <span className="px-2 py-1 rounded-md bg-[#e8f0ec] text-[#5a7a6a] text-xs">
                  个性化建议
                </span>
              </div>
            </motion.div>
            </Link>

            {/* Feature 3 */}
            <Link href="/courses" className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group p-8 rounded-2xl bg-[#faf8f5] border border-[#e8e4df] hover:border-[#8b7355]/30 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f0ebe4] flex items-center justify-center mb-6 group-hover:bg-[#8b7355] transition-colors">
                <Users className="w-6 h-6 text-[#8b7355] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[#2d2a26] mb-3">
                课程与社群
              </h3>
              <p className="text-[#9a9590] text-sm leading-relaxed mb-4">
                跟随Stella老师系统学习，从系统思维到品格教育。
                与同频家长一起成长，早期学员还可成为助教和咨询师。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-[#f5e6d8] text-[#c4753f] text-xs">
                  线上课程
                </span>
                <span className="px-2 py-1 rounded-md bg-[#e8f0ec] text-[#5a7a6a] text-xs">
                  线下咨询
                </span>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-[#8b7355] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                了解更多
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stella Intro */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#c4753f] to-[#8b7355] flex items-center justify-center mb-6">
                <Heart className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#2d2a26] mb-4">
                关于Stella老师
              </h2>
              <p className="text-[#9a9590] leading-relaxed mb-4">
                剑桥教育系统督导老师，20多年一线教学和管理经验。
                深耕品格教育和系统思维在家庭教育中的应用，
                专注于帮助家长建立长期主义的教育视角。
              </p>
              <p className="text-[#9a9590] leading-relaxed mb-6">
                她的教学理念：教育不是灌输，而是唤醒。
                家庭教育是一个复杂的自适应系统，
                父母的自我修行是教育成功的前提。
              </p>
              <div className="flex flex-wrap gap-3">
                {["系统思维", "冰山理论", "5C品格教育", "长期主义", "知行合一"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#f5e6d8] text-[#c4753f] text-sm"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {[
                { num: "20+", label: "年一线教育经验" },
                { num: "12", label: "大核心教育模块" },
                { num: "∞", label: "个家庭受益" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-xl bg-white border border-[#e8e4df]"
                >
                  <div className="text-3xl font-bold text-[#c4753f] mb-1">
                    {stat.num}
                  </div>
                  <div className="text-sm text-[#9a9590]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 转化入口：邀请码领取 */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-[#faf8f5]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 免费试听 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-white border border-[#e8e4df] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[#e8f0ec] flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#5a7a6a]" />
              </div>
              <h3 className="text-lg font-bold text-[#2d2a26] mb-2">免费体验AI咨询</h3>
              <p className="text-sm text-[#9a9590] mb-6 leading-relaxed">
                无需注册，立即向Stella老师提问。<br />
                体验系统思维如何帮你看见教育问题的整体。
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f5e6d8] text-[#c4753f] text-sm font-medium hover:bg-[#e8d5c4] transition-colors"
              >
                免费咨询
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* 领取邀请码 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-[#f5e6d8] border border-[#e8d5c4] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[#c4753f] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#2d2a26] mb-2">领取免费邀请码</h3>
              <p className="text-sm text-[#7a6a5a] mb-6 leading-relaxed">
                注册成为正式学员，解锁学员工具台、<br />
                成长图谱追踪和社群交流权限。
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c4753f] text-white text-sm font-medium hover:bg-[#a86235] transition-colors"
              >
                领取邀请码
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#c4753f]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            开始您的教育智慧之旅
          </h2>
          <p className="text-white/80 mb-8">
            每一个愿意学习和成长的家长，都已经给了孩子最好的礼物
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#c4753f] font-medium hover:bg-[#faf8f5] transition-colors shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            免费开始咨询
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#e8e4df]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#c4753f] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-[#9a9590]">
              Stella教育智囊 · FGAOS V4.0 · AI时代的家庭教育伙伴
            </span>
          </div>
          <p className="text-xs text-[#9a9590]">
            基于Stella老师20年教育经验 · 系统思维 · 品格教育
          </p>
        </div>
      </footer>
    </div>
  );
}
