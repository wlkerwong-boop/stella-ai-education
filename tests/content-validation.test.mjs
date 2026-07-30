import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readJson = async (path) =>
  JSON.parse(await readFile(new URL(path, root), "utf8"));

const requiredLessonFields = [
  "id",
  "week",
  "lesson",
  "theme",
  "coreConcepts",
  "practiceAssignments",
  "keywords",
  "themeIndex",
  "systemIndex",
];

test("模块八课程库保持模块→周→节结构并具备双索引", async () => {
  const course = await readJson("src/content/stella/module-8.json");

  assert.equal(course.module, 8);
  assert.equal(course.weeks.length, 4);
  assert.equal(course.weeks.flatMap((week) => week.lessons).length, 4);

  for (const week of course.weeks) {
    assert.equal(week.lessons.length, 1);
    for (const lesson of week.lessons) {
      for (const field of requiredLessonFields) {
        assert.ok(lesson[field], `${lesson.id ?? "未知课程"} 缺少 ${field}`);
      }
      assert.ok(lesson.coreConcepts.length >= 3);
      assert.ok(lesson.practiceAssignments.length >= 1);
      assert.ok(lesson.keywords.length >= 4);
      assert.ok(lesson.themeIndex.length >= 1);
      assert.ok(lesson.systemIndex.length >= 1);
    }
  }
});

test("咨询素材库覆盖六阶段，MVP聚焦小学高阶与初中", async () => {
  const library = await readJson(
    "src/content/stella/consultation-materials-m8.json",
  );
  const expectedStages = [
    "0-3岁",
    "3-6岁",
    "1-3年级",
    "4-6年级",
    "初中",
    "高中",
  ];

  assert.deepEqual(
    library.stages.map((stage) => stage.stage),
    expectedStages,
  );

  const mvpStages = library.stages.filter((stage) => stage.scope === "MVP");
  assert.deepEqual(
    mvpStages.map((stage) => stage.stage),
    ["4-6年级", "初中"],
  );
  assert.ok(mvpStages.every((stage) => stage.painPoints.length >= 4));

  for (const stage of mvpStages) {
    for (const item of stage.painPoints) {
      assert.ok(item.typicalBehaviors.length >= 1);
      assert.ok(item.theoreticalRoots.length >= 1);
      assert.ok(item.tools.length >= 1);
      assert.ok(item.methods.length >= 1);
      assert.ok(item.scripts.length >= 1);
    }
  }
});

test("新入库内容不含禁词、私密称谓或诊断性结论", async () => {
  const files = [
    "src/content/stella/module-8.json",
    "src/content/stella/consultation-materials-m8.json",
  ];
  const forbidden = [
    "创新" + "教育",
    "在家" + "学习",
    "home" + "school",
    "大宝",
    "小宝",
    "柚子",
    "确诊",
  ];

  for (const file of files) {
    const text = await readFile(new URL(file, root), "utf8");
    for (const term of forbidden) {
      assert.equal(text.includes(term), false, `${file} 含禁用内容：${term}`);
    }
  }
});
