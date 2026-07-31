import Link from "next/link";
import { HeroSection, FeatureCard } from "@/components/ui-client";
import { Brain, Target, Users, Heart, Sparkles, MessageCircle, ArrowRight } from "lucide-react";

const heroBgImage =
  "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1920&q=80";

const features = [
  {
    id: "ai-chat",
    icon: <Brain className="w-6 h-6" />,
    title: "🧠 AI教育问答",
    description:
      "基于Stella老师20年教育经验，用系统思维回答您的教育困惑。青春期沟通、厌学、多子女平衡……每个问题都得到深度分析。",
    href: "/chat",
    badges: ["系统思维", "冰山理论"],
  },
  {
    id: "growth-map",
    icon: <Target className="w-6 h-6" />,
    title: "🎯 思维进化图景",
    description:
      '记录您的每一次提问和反思，AI自动绘制您的成长轨迹。从"问题导向"到"系统思维"，看见自己的教育认知进化。',
    href: "/growth",
    badges: ["成长图谱", "个性化建议"],
  },
  {
    id: "courses",
    icon: <Users className="w-6 h-6" />,
    title: "👥 课程与社群",
    description:
      "跟随Stella老师系统学习，从系统思维到品格教育。与同频家长一起成长，早期学员还可成为助教和咨询师。",
    href: "/courses",
    badges: ["线上课程", "线下咨询"],
  },
];

const stats = [
  { num: "20+", label: "年一线教育经验" },
  { num: "12", label: "大核心教育模块" },
  { num: "∞", label: "个家庭受益" },
];

const stellaTags = ["系统思维", "冰山理论", "5C品格教育", "长期主义", "知行合一"];

const heroTitle = "用系统思维看见教育的整体";
const heroSubtitle = `每个孩子都是独特的系统。Stella老师融合系统思维、冰山理论、品格教育，帮助家长跳出\u201C头疼医头\u201D的困境，看见孩子行为背后的深层需求。`;

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* ===== Hero Section (共享 HeroSection 组件) ===== */}
      <HeroSection
        bgImage={heroBgImage}
        overlayFrom="var(--color-bg)"
        overlayTo="transparent"
        title={heroTitle}
        subtitle={heroSubtitle}
        cta={{
          label: "免费向Stella老师提问",
          href: "/chat",
          secondary: {
            label: "了解课程体系",
            href: "/courses",
          },
        }}
        align="center"
      />

      {/* ===== 三大核心服务 (FeatureCard 共享组件) ===== */}
      <section className="px-6 py-20 lg:px-10" style={{ background: "var(--color-bg)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--color-text)" }}>
              三大核心服务
            </h2>
            <p className="mx-auto max-w-xl text-lg" style={{ color: "var(--color-text-muted)" }}>
              从AI问答到系统学习，再到线下陪伴，构建完整的家庭教育支持体系
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="block no-underline"
              >
                <FeatureCard
                  id={feature.id}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={idx}
                />
                {/* Badges below card */}
                <div className="mt-3 flex flex-wrap gap-2 px-2">
                  {feature.badges.map((badge, bi) => (
                    <span
                      key={bi}
                      className="px-2.5 py-1 rounded-md text-xs font-medium"
                      style={{
                        background: bi % 2 === 0
                          ? "rgba(224, 122, 95, 0.12)"
                          : "rgba(90, 122, 106, 0.12)",
                        color: bi % 2 === 0
                          ? "var(--color-accent)"
                          : "var(--color-secondary)",
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 关于 Stella 老师 ===== */}
      <section className="px-6 py-20 lg:px-10" style={{ background: "var(--color-bg-card)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* 左侧头像占位 */}
            <div className="shrink-0">
              <div
                className="w-[150px] h-[150px] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--color-accent), #8B7355)",
                }}
              >
                <Heart className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* 右侧文字 */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
                关于Stella老师
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
                剑桥教育系统督导老师，20多年一线教学和管理经验。
                深耕品格教育和系统思维在家庭教育中的应用，
                专注于帮助家长建立长期主义的教育视角。
              </p>
              <p className="leading-relaxed mb-6" style={{ color: "var(--color-text-muted)" }}>
                她的教学理念：教育不是灌输，而是唤醒。
                家庭教育是一个复杂的自适应系统，
                父母的自我修行是教育成功的前提。
              </p>
              <div className="flex flex-wrap gap-3">
                {stellaTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      background: "rgba(224, 122, 95, 0.1)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 统计数据横排 */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl text-center"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  {stat.num}
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-dim)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 转化入口：邀请码领取 ===== */}
      <section
        className="px-6 py-16 lg:px-10"
        style={{
          background: `linear-gradient(to bottom, var(--color-bg-card), var(--color-bg))`,
        }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 免费体验AI咨询 */}
            <div
              className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--color-secondary-light)" }}
              >
                <MessageCircle className="w-6 h-6" style={{ color: "var(--color-secondary)" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                免费体验AI咨询
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                无需注册，立即向Stella老师提问。
                <br />
                体验系统思维如何帮你看见教育问题的整体。
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: "rgba(224, 122, 95, 0.1)",
                  color: "var(--color-accent)",
                }}
              >
                免费咨询
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 领取邀请码 */}
            <div
              className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              style={{
                background: "var(--color-bg-alt)",
                border: "1px solid var(--color-primary-dark)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--color-accent)" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                领取免费邀请码
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                注册成为正式学员，解锁学员工具台、
                <br />
                成长图谱追踪和社群交流权限。
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
                style={{ background: "var(--color-accent)" }}
              >
                领取邀请码
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 底部 CTA ===== */}
      <section
        className="px-6 py-20 lg:px-10"
        style={{ background: "var(--color-accent)" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            开始您的教育智慧之旅
          </h2>
          <p className="text-white/80 mb-8">
            每一个愿意学习和成长的家长，都已经给了孩子最好的礼物
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-colors shadow-lg"
            style={{
              background: "var(--color-bg)",
              color: "var(--color-accent)",
            }}
          >
            <MessageCircle className="w-5 h-5" />
            免费开始咨询
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
