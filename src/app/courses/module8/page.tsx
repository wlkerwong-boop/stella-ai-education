import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Compass,
  RefreshCw,
  Search,
  Wrench,
} from "lucide-react";

import { module8Course } from "@/lib/module8-knowledge";

const weekIcons = [Search, Compass, Wrench, RefreshCw];

export default function Module8Page() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-[#e8e0d8] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/courses"
              className="text-[#8a7a6a] transition-colors hover:text-[#8a7a5a]"
              aria-label="返回课程列表"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-[#3a3a3a]">
              模块八：{module8Course.title}
            </h1>
          </div>
          <span className="rounded-full bg-[#8a7a5a]/10 px-3 py-1 text-sm font-medium text-[#8a7a5a]">
            4周课程
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-8 rounded-2xl border border-[#e8e0d8] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#8a7a5a]">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-bold text-[#3a3a3a]">
                建立可以持续升级的自我管理系统
              </h2>
              <p className="leading-relaxed text-[#6f665d]">
                {module8Course.description}
                本模块不追求“永远自律”，而是帮助家长和孩子从行为背后看见系统，
                逐步学会降低启动阻力、恢复运行状态，并用反馈改善下一轮行动。
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {["看见系统", "启动系统", "稳定系统", "升级系统"].map(
              (label, index) => {
                const Icon = weekIcons[index];
                return (
                  <div
                    key={label}
                    className="rounded-xl bg-[#f3efe9] p-4 text-center"
                  >
                    <Icon className="mx-auto mb-2 h-5 w-5 text-[#8a7a5a]" />
                    <div className="text-sm font-medium text-[#3a3a3a]">
                      {label}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <section aria-labelledby="weekly-plan">
          <h2
            id="weekly-plan"
            className="mb-6 text-xl font-bold text-[#3a3a3a]"
          >
            四周学习路径
          </h2>
          <div className="space-y-5">
            {module8Course.weeks.map((week) => {
              const lesson = week.lessons[0];
              const Icon = weekIcons[week.week - 1];
              return (
                <article
                  key={lesson.id}
                  className="rounded-2xl border border-[#e8e0d8] bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8a7a5a] text-sm font-bold text-white">
                      {week.week}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8a7a5a]">
                        第{week.week}周 · 第{lesson.lesson}节
                      </p>
                      <h3 className="text-lg font-bold text-[#3a3a3a]">
                        {lesson.theme}
                      </h3>
                    </div>
                    <Icon className="ml-auto h-5 w-5 text-[#8a7a5a]" />
                  </div>

                  <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                    <div>
                      <h4 className="mb-2 text-sm font-bold text-[#3a3a3a]">
                        核心概念
                      </h4>
                      <ul className="space-y-2">
                        {lesson.coreConcepts.map((concept) => (
                          <li
                            key={concept}
                            className="flex gap-2 text-sm leading-relaxed text-[#6f665d]"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7a5a]" />
                            {concept}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-[#f8f5f1] p-4">
                      <h4 className="mb-2 text-sm font-bold text-[#3a3a3a]">
                        本周实践
                      </h4>
                      {lesson.practiceAssignments.map((assignment) => (
                        <p
                          key={assignment}
                          className="text-sm leading-relaxed text-[#6f665d]"
                        >
                          {assignment}
                        </p>
                      ))}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {lesson.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-lg bg-white px-2 py-1 text-xs text-[#8a7a5a]"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#8a7a5a]/20 bg-[#8a7a5a]/5 p-6">
          <h2 className="mb-2 font-bold text-[#3a3a3a]">使用边界</h2>
          <p className="text-sm leading-relaxed text-[#6f665d]">
            课程用于普适性家庭教育学习。面对持续影响睡眠、饮食、上学或日常功能的情况，
            应及时寻求合格的医疗或心理专业人员支持。
          </p>
        </section>
      </main>
    </div>
  );
}
