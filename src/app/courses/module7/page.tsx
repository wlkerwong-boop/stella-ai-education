import Link from 'next/link';
import { ArrowLeft, BookOpen, Lightbulb, Target, Users, Brain, FileText } from 'lucide-react';

export default function Module7Page() {
  const weeks = [
    {
      week: 1,
      title: '认识批判性思维与CER论证模型',
      core: 'CER模型：观点(Claim)-证据(Evidence)-推理(Reasoning)',
      status: '进行中',
      activities: [
        '理解批判性思维的五项核心能力',
        '学习CER论证框架',
        '针对三个孩子的差异化练习',
        '家庭实践：用ORID记录一次CER对话',
      ],
    },
    {
      week: 2,
      title: '提问的力量：如何引导孩子深度思考',
      core: '苏格拉底式提问法在家庭教育中的应用',
      status: '待开始',
      activities: ['学习开放式提问vs封闭式提问', '不同年龄段的提问策略', '家庭实践：设计一次探究式对话'],
    },
    {
      week: 3,
      title: '识别信息偏见与逻辑谬误',
      core: '在信息爆炸时代保护孩子的独立思考能力',
      status: '待开始',
      activities: ['常见逻辑谬误识别', '媒体信息分析练习', '家庭实践：一起分析一条新闻'],
    },
    {
      week: 4,
      title: '建立家庭思辨文化',
      core: '将批判性思维融入日常生活，形成可持续的家庭讨论氛围',
      status: '待开始',
      activities: ['家庭辩论会设计', '思维习惯养成', '总结与迁移：把批判性思维用到工作和人际关系中'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="border-b border-[#e8e0d8] bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-[#8a7a6a] hover:text-[#5a6a8a] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-[#3a3a3a]">模块七：批判性思维</h1>
          </div>
          <span className="px-3 py-1 rounded-full text-sm bg-[#5a6a8a]/10 text-[#5a6a8a] font-medium">4周课程</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Module Overview */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e8e0d8] mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#5a6a8a] flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#3a3a3a] mb-2">批判性思维</h2>
              <p className="text-[#8a7a6a] leading-relaxed">
                将品德教育中的价值观，转化为经过思辨后的教育选择，为后续习惯养成奠定理性基础。
                本模块的核心工具是<strong>CER论证模型</strong>（观点-证据-推理），
                帮助家长和孩子一起学会独立思考、理性判断。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: '概念理解', desc: '与AI互动学习' },
              { icon: Lightbulb, label: '思维工具', desc: 'CER论证模型' },
              { icon: Target, label: '案例分析', desc: 'AI陪练实践' },
              { icon: Users, label: '家庭实践', desc: 'ORID记录反思' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#f0f2f5] text-center">
                <item.icon className="w-5 h-5 text-[#5a6a8a] mx-auto mb-2" />
                <div className="font-medium text-sm text-[#3a3a3a]">{item.label}</div>
                <div className="text-xs text-[#8a7a6a] mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Family Context */}
        <div className="bg-gradient-to-r from-[#5a6a8a]/5 to-[#5a6a8a]/10 rounded-2xl p-6 border border-[#5a6a8a]/20 mb-8">
          <h3 className="font-bold text-[#3a3a3a] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#5a6a8a]" />
            你的家庭实践方案
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/80">
              <div className="text-sm font-bold text-[#5a6a8a] mb-1">大宝（15岁·成都住校）</div>
              <div className="text-xs text-[#8a7a6a]">完整CER+挑战假设</div>
              <div className="text-xs text-[#8a7a6a] mt-1">电话/视频时练习分析社会议题</div>
            </div>
            <div className="p-4 rounded-xl bg-white/80">
              <div className="text-sm font-bold text-[#5a6a8a] mb-1">柚子（10.5岁·Homeschool）</div>
              <div className="text-xs text-[#8a7a6a]">标准CER+引导推理链</div>
              <div className="text-xs text-[#8a7a6a] mt-1">日常对话中练习表达观点和理由</div>
            </div>
            <div className="p-4 rounded-xl bg-white/80">
              <div className="text-sm font-bold text-[#5a6a8a] mb-1">小宝（8.5岁·Homeschool）</div>
              <div className="text-xs text-[#8a7a6a]">简化版：观点+一个理由</div>
              <div className="text-xs text-[#8a7a6a] mt-1">建立"理由意识"的基础训练</div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <h3 className="text-xl font-bold text-[#3a3a3a] mb-6">每周学习计划</h3>
        <div className="space-y-4 mb-8">
          {weeks.map((w) => (
            <div key={w.week} className={`bg-white rounded-2xl p-6 shadow-sm border ${
              w.status === '进行中' ? 'border-[#5a6a8a]/40 ring-1 ring-[#5a6a8a]/20' : 'border-[#e8e0d8]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                    w.status === '进行中' ? 'bg-[#5a6a8a]' : 'bg-[#c8c0b8]'
                  }`}>
                    {w.week}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#3a3a3a]">{w.title}</h4>
                    <p className="text-sm text-[#8a7a6a]">{w.core}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  w.status === '进行中' ? 'bg-green-100 text-green-700' : 'bg-[#f0f0f0] text-[#8a7a6a]'
                }`}>
                  {w.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {w.activities.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#f0f2f5] text-xs text-[#5a6a8a]">{a}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Week 1 Detailed Content */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e8e0d8] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-[#5a6a8a]" />
            <h3 className="text-xl font-bold text-[#3a3a3a]">第一周详细内容</h3>
          </div>

          <div className="prose prose-sm max-w-none text-[#5a5a5a]">
            <h4>第一步：理解概念</h4>
            <p>批判性思维不是否定和挑错，而是以证据和价值为基础，通过分析、反思和判断，决定"相信什么"和"如何行动"的能力。</p>
            <p><strong>五项核心能力：</strong>提问能力、证据意识、逻辑推理、多角度思考、反思与修正</p>

            <h4>第二步：CER论证模型</h4>
            <div className="bg-[#f0f2f5] rounded-xl p-4 my-3">
              <p><strong>C - Claim（观点）：</strong>我认为什么是对的？</p>
              <p><strong>E - Evidence（证据）：</strong>我的依据是什么？</p>
              <p><strong>R - Reasoning（推理）：</strong>这些依据为什么支持这个主张？</p>
            </div>

            <h4>第三步：家庭实践</h4>
            <p>选一个教育决策，用CER工具写下来。本周建议：</p>
            <ul>
              <li>对老大：用CER讨论暑假安排或选课决策</li>
              <li>对柚子：用CER讨论homeschool课程调整</li>
              <li>对小宝：练习"观点+一个理由"的基础对话</li>
            </ul>

            <h4>第四步：ORID记录</h4>
            <div className="bg-[#f0f2f5] rounded-xl p-4 my-3 text-sm">
              <p><strong>O（事实）：</strong>发生了什么？孩子说了什么？</p>
              <p><strong>R（感受）：</strong>我的感受是什么？</p>
              <p><strong>I（思考）：</strong>我学到了什么？</p>
              <p><strong>D（行动）：</strong>下一步怎么调整？</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-[#f0f2f5] to-white rounded-2xl p-6 border border-[#e8e0d8]">
          <h3 className="font-bold text-[#3a3a3a] mb-3">AI推荐提示词</h3>
          <div className="bg-white rounded-xl p-4 border border-[#e8e0d8] text-sm text-[#5a5a5a] font-mono leading-relaxed">
            我在学习批判性思维第一周，刚理解了CER模型（观点-证据-推理）。<br />
            我家有三个女儿：15岁（住校）、10.5岁（homeschool）、8.5岁（homeschool）。<br />
            请用CER框架帮我分析以下教育决策：______<br />
            并用ORID帮我总结反思。
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/courses" className="text-sm text-[#5a6a8a] hover:underline">
            ← 返回课程列表
          </Link>
        </div>
      </main>
    </div>
  );
}
