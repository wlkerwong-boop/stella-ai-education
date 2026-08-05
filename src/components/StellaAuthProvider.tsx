'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { normalizeEmail, translateAuthError } from '@/lib/email-auth';
import { normalizeInviteCode } from '@/lib/invite-code';
import { hasSiteAccess } from '@/lib/site-access';
import { createClient } from '@/lib/supabase/client';

interface AuthResult {
  ok: boolean;
  message?: string;
  requiresEmailVerification?: boolean;
  requiresInvite?: boolean;
}

interface StellaAuthContextValue {
  user: User | null;
  loading: boolean;
  hasAccess: boolean;
  configured: boolean;
  signIn: (email: string, password: string, inviteCode?: string) => Promise<AuthResult>;
  signUp: (input: {
    email: string;
    password: string;
    nickname: string;
    inviteCode: string;
  }) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<AuthResult>;
}

const StellaAuthContext = createContext<StellaAuthContextValue | null>(null);

function redirectTo() {
  return `${window.location.origin}/auth/callback?next=/profile`;
}

function saveSafeUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem('stella_user');
    return;
  }
  localStorage.setItem('stella_user', JSON.stringify({
    id: user.id,
    email: user.email,
    nickname: user.user_metadata?.nickname || user.email?.split('@')[0] || '学员',
    invite_code: user.user_metadata?.invite_code || '',
    created_at: user.created_at,
  }));
}

export function StellaAuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async (currentUser: User | null) => {
    if (!supabase || !currentUser) {
      setHasAccess(false);
      return false;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('sites')
      .eq('auth_id', currentUser.id)
      .maybeSingle();
    const allowed = !error && hasSiteAccess(data?.sites, 'stella');
    setHasAccess(allowed);
    return allowed;
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user);
      saveSafeUser(data.user);
      await checkAccess(data.user);
      if (!active) return;
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      saveSafeUser(nextUser);
      if (!nextUser) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      window.setTimeout(() => {
        void checkAccess(nextUser).finally(() => setLoading(false));
      }, 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [checkAccess, supabase]);

  const signIn = useCallback(async (
    email: string,
    password: string,
    inputInviteCode = '',
  ): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: '登录服务尚未配置' };
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) {
      return { ok: false, message: translateAuthError(error.message || error.code || '') };
    }
    setUser(data.user);
    saveSafeUser(data.user);
    if (await checkAccess(data.user)) return { ok: true };

    const inviteCode = normalizeInviteCode(inputInviteCode);
    if (!inviteCode) {
      await supabase.auth.signOut();
      return {
        ok: false,
        requiresInvite: true,
        message: '此共享账号尚未开通 Stella，请输入邀请码',
      };
    }

    const { error: enrollError } = await supabase.rpc('enroll_stella', {
      p_invite_code: inviteCode,
    });
    if (enrollError || !(await checkAccess(data.user))) {
      await supabase.auth.signOut();
      return { ok: false, requiresInvite: true, message: '邀请码无效或已使用' };
    }
    return { ok: true };
  }, [checkAccess, supabase]);

  const signUp = useCallback(async (input: {
    email: string;
    password: string;
    nickname: string;
    inviteCode: string;
  }): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: '注册服务尚未配置' };

    const inviteCode = normalizeInviteCode(input.inviteCode);
    const verifyResponse = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: inviteCode }),
    });
    const verification = await verifyResponse.json().catch(() => ({}));
    if (!verifyResponse.ok || !verification.valid) {
      return { ok: false, message: verification.message || '邀请码验证失败' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(input.email),
      password: input.password,
      options: {
        emailRedirectTo: redirectTo(),
        data: {
          nickname: input.nickname.trim(),
          invite_code: inviteCode,
          source_site: 'stella',
        },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes('database error saving new user')) {
        return { ok: false, message: '邀请码无效、已使用或账号配置尚未完成' };
      }
      return { ok: false, message: translateAuthError(error.message || error.code || '') };
    }
    if (data.user?.identities?.length === 0) {
      return {
        ok: false,
        requiresInvite: true,
        message: '该邮箱已是三站共享账号，请切换到登录并输入 Stella 邀请码',
      };
    }
    if (data.session) await checkAccess(data.user);
    return { ok: true, requiresEmailVerification: !data.session };
  }, [checkAccess, supabase]);

  const resendVerification = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: '验证邮件服务尚未配置' };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizeEmail(email),
      options: { emailRedirectTo: redirectTo() },
    });
    return error
      ? { ok: false, message: translateAuthError(error.message || error.code || '') }
      : { ok: true };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setHasAccess(false);
    saveSafeUser(null);
  }, [supabase]);

  const updateNickname = useCallback(async (nickname: string): Promise<AuthResult> => {
    const trimmed = nickname.trim();
    if (!supabase || trimmed.length < 2 || trimmed.length > 20) {
      return { ok: false, message: '昵称长度需在 2-20 个字符之间' };
    }
    const { data, error } = await supabase.auth.updateUser({ data: { nickname: trimmed } });
    if (error) return { ok: false, message: translateAuthError(error.message || error.code || '') };
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ nickname: trimmed })
      .eq('auth_id', data.user.id);
    if (profileError) return { ok: false, message: '昵称暂时无法保存，请稍后再试' };
    setUser(data.user);
    saveSafeUser(data.user);
    return { ok: true };
  }, [supabase]);

  return (
    <StellaAuthContext.Provider value={{
      user,
      loading,
      hasAccess,
      configured: Boolean(supabase),
      signIn,
      signUp,
      resendVerification,
      signOut,
      updateNickname,
    }}>
      {children}
    </StellaAuthContext.Provider>
  );
}

export function useStellaAuth() {
  const context = useContext(StellaAuthContext);
  if (!context) throw new Error('useStellaAuth must be used within StellaAuthProvider');
  return context;
}
