-- Stella 工具系统 建表 + seed 脚本
-- 用于 Hermes 部署时执行
-- 版本：2026-07-30
-- 来源：materials/2026-07-30-stella工具规格卡与候选清单-Codex.md

-- ====== 1. tool_definitions 表 ======
CREATE TABLE IF NOT EXISTS tool_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'k3_approved', 'implemented', 'deployed', 'retired')),
  applicable_stages TEXT[] NOT NULL DEFAULT '{}',
  pain_points TEXT[] NOT NULL DEFAULT '{}',
  theoretical_basis JSONB NOT NULL DEFAULT '[]',
  input_schema JSONB NOT NULL DEFAULT '[]',
  output_schema JSONB NOT NULL DEFAULT '[]',
  operation_steps JSONB NOT NULL DEFAULT '[]',
  script_examples JSONB NOT NULL DEFAULT '[]',
  reflection_guide JSONB NOT NULL DEFAULT '{}',
  growth_map_fields TEXT[] NOT NULL DEFAULT '{}',
  not_for TEXT[] NOT NULL DEFAULT '{}',
  safety_rules JSONB NOT NULL DEFAULT '{}',
  source_references JSONB NOT NULL DEFAULT '[]',
  acceptance_rules JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====== 2. tool_usage_records 表 ======
CREATE TABLE IF NOT EXISTS tool_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_definition_id UUID REFERENCES tool_definitions(id) ON DELETE SET NULL,
  tool_version TEXT NOT NULL DEFAULT '1.0.0',
  user_id UUID NOT NULL,
  child_stage TEXT NOT NULL DEFAULT '',
  input_data JSONB NOT NULL DEFAULT '{}',
  output_data JSONB NOT NULL DEFAULT '{}',
  orid_summary JSONB NOT NULL DEFAULT '{}',
  growth_event_id UUID,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'shared-with-stella', 'public')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'completed', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====== 3. RLS 策略 ======
-- 普通用户只能读已批准的工具定义
ALTER TABLE tool_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read approved tools"
  ON tool_definitions FOR SELECT
  USING (status IN ('k3_approved', 'implemented', 'deployed'));

-- 用户只能读写自己的使用记录
ALTER TABLE tool_usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own records"
  ON tool_usage_records FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records"
  ON tool_usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records"
  ON tool_usage_records FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records"
  ON tool_usage_records FOR DELETE
  USING (auth.uid() = user_id);

-- ====== 4. 旧表处置 ======
-- tool_records 当前为空表，可重命名或废止
-- ALTER TABLE tool_records RENAME TO tool_records_deprecated_20260730;
-- 或保留作为旧工具（ORID/emotion/iceberg等）的兼容存储

-- ====== 5. T01-T08 初始化 INSERT（需在 Supabase 管理台或 API 执行） ======
-- 以下 INSERT 语句含完整规格卡数据，来源为 K3 已批准版本
-- 执行前确认 frontend/src/lib/tool-definitions.ts 中的 seed 数据与此一致

INSERT INTO tool_definitions (tool_id, name, version, status, applicable_stages, pain_points, theoretical_basis) VALUES
('t01-system-map', '自我管理系统地图', '1.0.0', 'k3_approved',
 ARRAY['4-6年级', '初中', '高中'],
 ARRAY['拖延', '反复催促', '总是放弃', '计划执行不下去', '电子产品挤占任务'],
 '["模块八将自我管理定义为目标、动机、能力、情绪、精力、环境、反馈和调整共同作用的动态系统","执行功能与自我调节支撑计划、专注、自控、觉察和灵活调整"]'::jsonb),
('t02-wish-list', '假期梦想清单', '1.0.0', 'k3_approved',
 ARRAY['1-3年级', '4-6年级', '初中', '高中'],
 ARRAY['假期无目标', '计划全由家长制定', '孩子只想被动娱乐'],
 '["模块八逐字稿提出从体验、学习、帮助、留下等类别引导孩子列清单","自我决定理论认为自主、胜任与联结需要得到支持"]'::jsonb),
('t03-top3', '今日三件大事', '1.0.0', 'k3_approved',
 ARRAY['1-3年级', '4-6年级', '初中'],
 ARRAY['计划过满', '优先级混乱', '一天结束仍无完成感'],
 '["模块八逐字稿明确提出一天三件大事由孩子自己安排，根据精力和结果调整顺序","训练计划、排序和监控，不把时间表做成家长监督表"]'::jsonb),
('t04-micro-step', '微步启动与脚手架', '1.0.0', 'k3_approved',
 ARRAY['1-3年级', '4-6年级', '初中'],
 ARRAY['知道要做却迟迟不开始', '面对复杂任务卡住', '持续依赖提醒'],
 '["模块八第二课强调能力不足时搭脚手架，能力提升后逐步撤除","执行功能可在适龄挑战与练习中发展"]'::jsonb),
('t05-dashboard', '情绪—压力—精力仪表盘', '1.0.0', 'k3_approved',
 ARRAY['4-6年级', '初中', '高中'],
 ARRAY['情绪波动', '压力累积', '精力不足', '注意力难以维持', '任务安排与状态不匹配'],
 '["模块八第三课将情绪视为信号、压力视为需要调节的系统变量","工具只做觉察，不宣称治疗"]'::jsonb),
('t06-3l-review', '3L 每日复盘', '1.0.0', 'k3_approved',
 ARRAY['1-3年级', '4-6年级', '初中', '高中'],
 ARRAY['一天只有完成/没完成', '错误只带来自责', '家长复盘变检查'],
 '["模块八逐字稿给出三个问题：Learned/Loved/Lesson 快速复盘","工具目标是快速回顾，不是绩效考核"]'::jsonb),
('t07-feedback', '反馈—反思—调整卡', '1.0.0', 'k3_approved',
 ARRAY['4-6年级', '初中', '高中'],
 ARRAY['一次失败就否定自己', '方法失效仍重复', '家长把评价当反馈'],
 '["模块八第四课规定连续优化流程：行动→反馈→反思→调整→下一轮","反馈是事实，反思是解释系统，调整是决定下一步"]'::jsonb),
('t08-orid-record', 'ORID 家庭实践记录', '1.0.0', 'k3_approved',
 ARRAY['0-3岁', '3-6岁', '1-3年级', '4-6年级', '初中', '高中'],
 ARRAY['实践后无沉淀', '只记录事件不记录认识与决定', '成长图谱缺少连续数据'],
 '["模块八四课均要求用 ORID 记录家庭实践","ORID 是数据沉淀结构，不等于强制写长日记"]'::jsonb);
