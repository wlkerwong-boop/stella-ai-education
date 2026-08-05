import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEmail, translateAuthError, validateRegistration } from '../src/lib/email-auth.ts';
import { isKnownInviteCode, normalizeInviteCode } from '../src/lib/invite-code.ts';
import { FixedWindowRateLimiter } from '../src/lib/rate-limit.ts';
import { parseBearerToken } from '../src/lib/bearer-token.ts';
import { hasSiteAccess } from '../src/lib/site-access.ts';

test('邮箱认证规则在 QQ、Gmail 和 Outlook 地址上保持一致', () => {
  assert.equal(normalizeEmail('  Parent.QQ@QQ.COM '), 'parent.qq@qq.com');
  assert.equal(normalizeEmail('Student@gmail.com'), 'student@gmail.com');
  assert.equal(validateRegistration({
    email: 'bad-email',
    password: 'stella2026',
    confirmPassword: 'stella2026',
    nickname: '星星妈妈',
  }), '请输入有效的邮箱地址');
  assert.equal(validateRegistration({
    email: 'parent@outlook.com',
    password: 'abcdefgh',
    confirmPassword: 'abcdefgh',
    nickname: '星星妈妈',
  }), '密码至少 8 位，且必须同时包含字母和数字');
  assert.equal(validateRegistration({
    email: 'parent@outlook.com',
    password: 'stella2026',
    confirmPassword: 'stella2027',
    nickname: '星星妈妈',
  }), '两次输入的密码不一致');
});

test('认证服务错误转换为清晰中文提示', () => {
  assert.equal(translateAuthError('Invalid login credentials'), '邮箱或密码不正确');
  assert.equal(translateAuthError('Email not confirmed'), '请先前往邮箱完成验证');
  assert.equal(translateAuthError('User already registered'), '该邮箱已注册，请直接登录');
  assert.equal(translateAuthError('over_email_send_rate_limit'), '验证邮件发送过于频繁，请稍后再试');
});

test('Stella 邀请码只接受预置范围并统一大写', () => {
  assert.equal(normalizeInviteCode(' stella-001 '), 'STELLA-001');
  assert.equal(isKnownInviteCode('STELLA-001'), true);
  assert.equal(isKnownInviteCode('STELLA-030'), true);
  assert.equal(isKnownInviteCode('STELLA-000'), false);
  assert.equal(isKnownInviteCode('STELLA-031'), false);
  assert.equal(isKnownInviteCode('SOUL-001'), false);
});

test('邀请码验证接口在窗口内限制重复请求', () => {
  let now = 0;
  const limiter = new FixedWindowRateLimiter(2, 1_000, () => now);
  assert.equal(limiter.allow('client-a'), true);
  assert.equal(limiter.allow('client-a'), true);
  assert.equal(limiter.allow('client-a'), false);
  assert.equal(limiter.allow('client-b'), true);
  now = 1_001;
  assert.equal(limiter.allow('client-a'), true);
});

test('工具 API 只接受标准 Bearer 会话头', () => {
  assert.equal(parseBearerToken('Bearer access-token'), 'access-token');
  assert.equal(parseBearerToken('bearer access-token'), 'access-token');
  assert.equal(parseBearerToken('Basic abc'), null);
  assert.equal(parseBearerToken(null), null);
});

test('Stella 权限只对已加入 Stella 的共享账号开放', () => {
  assert.equal(hasSiteAccess(['soulcode', 'stella'], 'stella'), true);
  assert.equal(hasSiteAccess(['soulcode'], 'stella'), false);
  assert.equal(hasSiteAccess(null, 'stella'), false);
});
