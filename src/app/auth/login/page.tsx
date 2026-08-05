'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, Mail, Sparkles, UserRound } from 'lucide-react';
import { useStellaAuth } from '@/components/StellaAuthProvider';
import {
  isValidEmail,
  normalizeEmail,
  validateRegistration,
} from '@/lib/email-auth';
import { isKnownInviteCode, normalizeInviteCode } from '@/lib/invite-code';

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    hasAccess,
    configured,
    signIn,
    signUp,
    resendVerification,
  } = useStellaAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [loginNeedsInvite, setLoginNeedsInvite] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') setNotice('邮箱验证成功，您已安全登录');
    if (params.get('error') === 'verification') setError('验证链接无效或已过期，请重新发送验证邮件');
    if (params.get('error') === 'config') setError('登录服务尚未完成配置');
    if (params.get('access') === 'required') {
      setLoginNeedsInvite(true);
      setError('此共享账号需使用 Stella 邀请码完成首次开通');
    }
  }, []);

  useEffect(() => {
    if (user && hasAccess && !awaitingVerification) router.replace('/profile');
  }, [awaitingVerification, hasAccess, router, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!isValidEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    if (mode === 'register') {
      const validationError = validateRegistration({
        email,
        password,
        confirmPassword,
        nickname,
      });
      if (validationError) {
        setError(validationError);
        return;
      }
      if (!isKnownInviteCode(inviteCode)) {
        setError('请输入有效的 Stella 邀请码');
        return;
      }
    } else if (loginNeedsInvite && !isKnownInviteCode(inviteCode)) {
      setError('请输入有效的 Stella 邀请码');
      return;
    }

    setBusy(true);
    const result = mode === 'login'
      ? await signIn(email, password, loginNeedsInvite ? normalizeInviteCode(inviteCode) : '')
      : await signUp({
          email,
          password,
          nickname,
          inviteCode: normalizeInviteCode(inviteCode),
        });
    setBusy(false);

    if (!result.ok) {
      if (result.requiresInvite) {
        setMode('login');
        setLoginNeedsInvite(true);
      }
      setError(result.message || '操作失败，请稍后重试');
      return;
    }
    if (result.requiresEmailVerification) {
      setAwaitingVerification(true);
      setNotice(`验证邮件已发送至 ${normalizeEmail(email)}，请点击邮件中的链接完成注册`);
      return;
    }
    router.push('/profile');
  };

  const resend = async () => {
    setBusy(true);
    setError('');
    const result = await resendVerification(email);
    setBusy(false);
    if (result.ok) setNotice('验证邮件已重新发送，请检查收件箱和垃圾邮件目录');
    else setError(result.message || '邮件发送失败，请稍后重试');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8b837d] hover:text-[#2d2a26] mb-6">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-[#c4753f] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#2d2a26]">Stella 学员账号</h1>
          <p className="text-sm leading-relaxed text-[#8b837d] mt-2">
            使用您的常用邮箱登录；新学员注册仍需邀请码
          </p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm space-y-4">
          <div className="flex rounded-full bg-[#f1ede8] p-1">
            {(['login', 'register'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError('');
                  setNotice('');
                  setAwaitingVerification(false);
                  if (item === 'register') setLoginNeedsInvite(false);
                }}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  mode === item ? 'bg-white text-[#c4753f] shadow-sm' : 'text-[#8b837d]'
                }`}
              >
                {item === 'login' ? '登录' : '邀请码注册'}
              </button>
            ))}
          </div>

          {!configured && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              登录服务尚未完成配置
            </p>
          )}

          {(mode === 'register' || loginNeedsInvite) && (
            <>
              <label className="block text-sm font-medium text-[#2d2a26]">
                {mode === 'register' ? '邀请码' : '首次开通邀请码'}
                <input
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  placeholder="例如：STELLA-001"
                  autoComplete="off"
                  className="mt-2 w-full rounded-xl border border-[#e8e4df] bg-[#faf8f5] px-4 py-3 font-normal focus:outline-none focus:ring-2 focus:ring-[#c4753f]/20"
                  required
                />
              </label>
              {mode === 'register' && <label className="block text-sm font-medium text-[#2d2a26]">
                昵称
                <span className="relative mt-2 block">
                  <UserRound className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#8b837d]" />
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="如：小明妈妈"
                    autoComplete="nickname"
                    maxLength={20}
                    className="w-full rounded-xl border border-[#e8e4df] bg-[#faf8f5] py-3 pl-10 pr-4 font-normal focus:outline-none focus:ring-2 focus:ring-[#c4753f]/20"
                    required
                  />
                </span>
              </label>}
            </>
          )}

          <label className="block text-sm font-medium text-[#2d2a26]">
            邮箱
            <span className="relative mt-2 block">
              <Mail className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#8b837d]" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="QQ、Gmail、Outlook、163 等邮箱"
                autoComplete="email"
                className="w-full rounded-xl border border-[#e8e4df] bg-[#faf8f5] py-3 pl-10 pr-4 font-normal focus:outline-none focus:ring-2 focus:ring-[#c4753f]/20"
                required
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-[#2d2a26]">
            密码
            <span className="relative mt-2 block">
              <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#8b837d]" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'register' ? '至少 8 位，同时包含字母和数字' : '请输入密码'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full rounded-xl border border-[#e8e4df] bg-[#faf8f5] py-3 pl-10 pr-4 font-normal focus:outline-none focus:ring-2 focus:ring-[#c4753f]/20"
                required
              />
            </span>
          </label>

          {mode === 'register' && (
            <label className="block text-sm font-medium text-[#2d2a26]">
              确认密码
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="请再次输入密码"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-[#e8e4df] bg-[#faf8f5] px-4 py-3 font-normal focus:outline-none focus:ring-2 focus:ring-[#c4753f]/20"
                required
              />
            </label>
          )}

          {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm leading-relaxed text-red-600">{error}</p>}
          {notice && <p aria-live="polite" className="rounded-xl bg-[#eef4f0] px-3 py-2 text-sm leading-relaxed text-[#4f725f]">{notice}</p>}

          {awaitingVerification ? (
            <button type="button" onClick={resend} disabled={busy} className="w-full rounded-xl bg-[#5a7a6a] py-3 font-medium text-white disabled:opacity-50">
              {busy ? '发送中…' : '重新发送验证邮件'}
            </button>
          ) : (
            <button type="submit" disabled={busy || !configured} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c4753f] py-3 font-medium text-white transition-colors hover:bg-[#a86235] disabled:opacity-50">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? '请稍候…' : mode === 'login' ? '登录' : '注册并发送验证邮件'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
