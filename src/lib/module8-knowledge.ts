import consultationMaterials from "@/content/stella/consultation-materials-m8.json";
import module8 from "@/content/stella/module-8.json";

type Module8Lesson = (typeof module8.weeks)[number]["lessons"][number];
type PainPoint =
  (typeof consultationMaterials.stages)[number]["painPoints"][number];

export const module8Course = module8;
export const module8ConsultationMaterials = consultationMaterials;

const lessonToContent = (lesson: Module8Lesson) => `主题：${lesson.theme}

核心概念：
${lesson.coreConcepts.map((item, index) => `${index + 1}. ${item}`).join("\n")}

实践作业：
${lesson.practiceAssignments.map((item) => `- ${item}`).join("\n")}

按痛点索引：${lesson.themeIndex.join("、")}
按进阶索引：${lesson.systemIndex.join("、")}`;

export const module8KnowledgeItems = [
  ...module8.weeks.flatMap((week) =>
    week.lessons.map((lesson) => ({
      id: lesson.id,
      category: "自我管理",
      title: `第${week.week}周：${lesson.theme}`,
      content: lessonToContent(lesson),
      tags: [
        ...lesson.keywords,
        ...lesson.themeIndex,
        ...lesson.systemIndex,
        "模块八",
      ],
    })),
  ),
  ...consultationMaterials.stages.flatMap((stage) =>
    stage.painPoints.map((painPoint: PainPoint) => ({
      id: painPoint.id,
      category: `自我管理咨询素材·${stage.stage}`,
      title: painPoint.title,
      content: `典型行为：
${painPoint.typicalBehaviors.map((item) => `- ${item}`).join("\n")}

理论根源：
${painPoint.theoreticalRoots.map((item) => `- ${item}`).join("\n")}

落地工具：${painPoint.tools.join("、")}

方法：
${painPoint.methods.map((item) => `- ${item}`).join("\n")}

可用话术：
${painPoint.scripts.map((item) => `- ${item}`).join("\n")}`,
      tags: [
        stage.stage,
        "自我管理",
        painPoint.title,
        ...painPoint.tools,
      ],
    })),
  ),
];
