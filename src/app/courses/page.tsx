"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Video,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Star,
} from "lucide-react";

const modules = [
  {
    id: 1,
    title: "模块一：系统思维",
    description: "用系统思维重塑对教育的理解，跳出局部看整体",
    duration: "4周",
    lessons: 4,
    topics: [
      "系统思维核心概念：涌现、反馈回路、延迟效应",
      "冰山理论与深层需求觉察",
      "金字塔原理与结构化思考",
      "系统分析与解决问题的五步法",
    ],
    status: "已开课",
    color: "#c4753f",
    bgColor: "#f5e6d8",
  },
  {
    id: 2,
    title: "模块二：长期主义",
    description: "从知道到做到，掌握应对不确定性的唯一武器",
    duration: "4周",
    lessons: 4,
    topics: [
      "长期主义教育观：时间维度上的决策智慧",
      "知行合一：从知道到做到的家庭践行",
      "100格生命游戏与三个账户",
      "反思、行动与系统结合",
    ],
    status: "已开课",
    color: "#5a7a6a",
    bgColor: "#e8f0ec",
  },
  {
    id: 3,
    title: "模块三：学习力",
    description: "快速有效地学习是一种可以培养和训练的能力",
    duration: "4周",
    lessons: 4,
    topics: [
      "28定律/帕累托法则在家庭教育中的应用",
      "战略型父母：识别关键20%",
      "元认知能力：让孩子学会学习",
      "学习力系统培养方法",
    ],
    status: "已开课",
    color: "#8b7355",
    bgColor: "#f0ebe4",
  },
  {
    id: 4,
    title: "模块四：注意力",
    description: "如何保护好孩子独有的稀缺资源",
    duration: "4周",
    lessons: 4,
    topics: [
      "注意力的科学原理与特点",
      "保护和培养注意力的方法",
      "注意力发展的阶段规律",
      "家庭环境与注意力管理",
    ],
    status: "已开课",
    color: "#7a6a8a",
    bgColor: "#ece8f0",
  },
  {
    id: 5,
    title: "模块五：教练式对话",
    description: "掌握有效指导的方法和技巧，激励与赋能孩子的成长",
    duration: "4周",
    lessons: 4,
    topics: [
      "沟通是一场无限游戏",
      "与孩子沟通的五项原则",
      "ORID反思模型与日常应用",
      "从管理者到顾问：父母角色转变",
    ],
    status: "已开课",
    color: "#6a8a7a",
    bgColor: "#e8f0ec",
  },
  {
    id: 6,
    title: "模块六：品格形成",
    description: "从日常小事入手，培养和形成良好的品格",
    duration: "4周",
    lessons: 4,
    topics: [
      "八大核心品格：诚实、责任、尊重、勇气、同理心、感恩、谦逊、毅力",
      "品格排序与家庭价值观对齐",
      "儿童品格发展的年龄规律",
      "日常生活中的品格培养实践",
    ],
    status: "进行中",
    color: "#8a6a6a",
    bgColor: "#f0e8e8",
  },
  {
    id: 7,
    title: "模块七：批判性思维",
    description: "学会独立思考和从多角度思考，主动解决问题",
    duration: "4周",
    lessons: 4,
    topics: [
      "批判性思维的核心要素",
      "如何引导孩子质疑与求证",
      "多角度思考与换位思考",
      "从被动接受到主动探究",
    ],
    status: "即将开课",
    color: "#5a6a8a",
    bgColor: "#e8ecf0",
  },
  {
    id: 8,
    title: "模块八：自我管理",
    description: "识别情绪、觉知行为，进行自我调整和管理",
    duration: "4周",
    lessons: 4,
    topics: [
      "情绪识别与情绪调节",
      "自我觉知与行为管理",
      "适应环境与迎接挑战",
      "建立个人目标与执行系统",
    ],
    status: "即将开课",
    color: "#8a7a5a",
    bgColor: "#f0ece4",
  },
  {
    id: 9,
    title: "模块九：社交协作",
    description: "有效沟通，高效协作，处理分歧，达成目标",
    duration: "4周",
    lessons: 4,
    topics: [
      "社交能力的发展规律",
      "团队协作与领导力培养",
      "冲突处理与分歧化解",
      "建立健康的人际边界",
    ],
    status: "即将开课",
    color: "#6a7a8a",
    bgColor: "#e8ecf0",
  },
  {
    id: 10,
    title: "模块十：人机协作",
    description: "掌握使用主流AI工具策略，清晰提问，识别防范风险",
    duration: "4周",
    lessons: 4,
    topics: [
      "AI时代家庭教育的新范式",
      "如何向AI提出高质量问题",
      "利用AI辅助个性化学习",
      "识别风险与建立数字素养",
    ],
    status: "即将开课",
    color: "#7a5a6a",
    bgColor: "#f0e8ec",
  },
  {
    id: 11,
    title: "模块十一：创造力和创新思维",
    description: "鼓励跨学科探索与边界混合，试错并从错误中学习",
    duration: "4周",
    lessons: 4,
    topics: [
      "创造力的心理学基础",
      "跨学科探索与边界混合",
      "鼓励试错与从错误中学习",
      "家庭中的创新环境营造",
    ],
    status: "即将开课",
    color: "#5a8a6a",
    bgColor: "#e8f0ec",
  },
  {
    id: 12,
    title: "模块十二：精进与迭代",
    description: "运用系统思维回顾教育成果，调整和升级家庭教育策略",
    duration: "4周",
    lessons: 4,
    topics: [
      "年度教育成果回顾方法",
      "系统思维在复盘中的应用",
      "家庭教育策略的迭代升级",
      "持续精进的成长型家庭",
    ],
    status: "即将开课",
    color: "#8a5a7a",
    bgColor: "#f0e8f0",
  },
];

const features = [
  {
    icon: Video,
    title: "录播课程",
    desc: "精心录制的视频课程，随时回看",
  },
  {
    icon: Users,
    title: "线上共学",
    desc: "与同频家长一起学习讨论",
  },
  {
    icon: Calendar,
    title: "每周作业",
    desc: "理论结合实践，学以致用",
  },
  {
    icon: Star,
    title: "案例点评",
    desc: "Stella老师亲自点评作业",
  },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
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
            <span className="font-medium text-[#2d2a26]">课程体系</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5e6d8] text-[#c4753f] text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            系统化家庭教育课程
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2d2a26] mb-4">
            AI时代如何做家长
          </h1>
          <p className="text-[#9a9590] max-w-2xl mx-auto leading-relaxed">
            跟随Stella老师，从系统思维到品格教育，建立完整的家庭教育认知体系。
            不只是听课，更是在实践中与AI互动、与同伴共学、在反思中成长。
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f5e6d8] flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-6 h-6 text-[#c4753f]" />
                </div>
                <h3 className="font-medium text-[#2d2a26] mb-1">{f.title}</h3>
                <p className="text-xs text-[#9a9590]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Modules */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-8 text-center">
            十二大核心模块
          </h2>
          <div className="space-y-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: module.color }}
                      >
                        M{module.id}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2d2a26]">
                          {module.title}
                        </h3>
                        <p className="text-sm text-[#9a9590]">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: module.bgColor,
                        color: module.color,
                      }}
                    >
                      {module.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#9a9590] mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {module.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {module.lessons}节课
                    </span>
                  </div>

                  <div className="space-y-2">
                    {module.topics.map((topic, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-[#2d2a26]"
                      >
                        <ChevronRight
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: module.color }}
                        />
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#c4753f]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            加入学习社群
          </h2>
          <p className="text-white/80 mb-8">
            与志同道合的家长一起成长，早期学员还有机会成为助教和咨询师
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 rounded-full bg-white text-[#c4753f] font-medium hover:bg-[#faf8f5] transition-colors">
              了解报名方式
            </button>
            <Link
              href="/chat"
              className="px-8 py-3 rounded-full border-2 border-white text-white font-medium hover:bg-white/10 transition-colors"
            >
              先免费咨询
            </Link>
          </div>
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
              Stella教育智囊 - AI时代的家庭教育伙伴
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
