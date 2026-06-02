-- =============================================
-- Stella教育智囊 - Supabase 数据库建表SQL
-- 使用方法：打开 https://supabase.com/dashboard/project/tnmbesyjsftephqmwsmw/sql/new
-- 粘贴全部内容，点击 "Run" 按钮
-- =============================================

-- 1. 用户档案表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  invite_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 邀请码表（30个预置码）
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO invite_codes (code) VALUES
  ('STELLA-001'),('STELLA-002'),('STELLA-003'),('STELLA-004'),('STELLA-005'),
  ('STELLA-006'),('STELLA-007'),('STELLA-008'),('STELLA-009'),('STELLA-010'),
  ('STELLA-011'),('STELLA-012'),('STELLA-013'),('STELLA-014'),('STELLA-015'),
  ('STELLA-016'),('STELLA-017'),('STELLA-018'),('STELLA-019'),('STELLA-020'),
  ('STELLA-021'),('STELLA-022'),('STELLA-023'),('STELLA-024'),('STELLA-025'),
  ('STELLA-026'),('STELLA-027'),('STELLA-028'),('STELLA-029'),('STELLA-030')
ON CONFLICT (code) DO NOTHING;

-- 3. 工具记录表（ORID/情绪/冰山/践行卡/品格自测）
CREATE TABLE IF NOT EXISTS tool_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('orid','emotion','iceberg','action-card','character')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','shared-with-stella','public')),
  tags TEXT[] DEFAULT '{}',
  stella_comment TEXT,
  stella_comment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 权限策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_records ENABLE ROW LEVEL SECURITY;

-- profiles：用户可以读取和更新自己的档案
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth_id = auth.uid());

-- invite_codes：任何人可读取（验证用）
CREATE POLICY "anyone_read_invite_codes" ON invite_codes
  FOR SELECT USING (TRUE);

-- 服务端可以更新邀请码（标记已使用）
CREATE POLICY "server_update_invite_codes" ON invite_codes
  FOR UPDATE USING (TRUE);

-- tool_records
CREATE POLICY "users_crud_own_records" ON tool_records
  FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()));

CREATE POLICY "stella_read_shared" ON tool_records
  FOR SELECT USING (visibility = 'shared-with-stella' OR visibility = 'public');

CREATE POLICY "anyone_read_public" ON tool_records
  FOR SELECT USING (visibility = 'public');

-- 5. 自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tool_records_updated_at
  BEFORE UPDATE ON tool_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
