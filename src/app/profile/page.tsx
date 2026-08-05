'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useStellaAuth } from '@/components/StellaAuthProvider';

function formatTime(value?: string) {
  if (!value) return '暂无记录';
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, hasAccess, signOut, updateNickname } = useStellaAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
    if (!loading && user && !hasAccess) router.replace('/auth/login?access=required');
  }, [hasAccess, loading, router, user]);

  if (loading || !user || !hasAccess) {
    return <div className="min-h-[70vh] grid place-items-center text-sm text-[#8b837d]">加载账号信息…</div>;
  }

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || 'Stella 学员';

  const saveNickname = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await updateNickname(String(formData.get('nickname') || ''));
    setMessage(result.ok ? '昵称已更新' : result.message || '更新失败');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] px-4 py-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-sm tracking-[0.2em] text-[#c4753f]">STELLA PROFILE</p>
          <h1 className="mt-2 text-3xl font-bold text-[#2d2a26]">个人中心</h1>
        </div>

        <section className="rounded-2xl border border-[#e8e4df] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#f5e6d8] text-2xl font-bold text-[#c4753f]">
              {nickname.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-[#2d2a26]">{nickname}</h2>
              <p className="mt-1 break-all text-sm text-[#8b837d]">{user.email}</p>
              <div className="mt-4 grid gap-2 text-sm text-[#6f6862] sm:grid-cols-2">
                <p>注册时间：{formatTime(user.created_at)}</p>
                <p>最近登录：{formatTime(user.last_sign_in_at)}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                router.push('/auth/login');
              }}
              className="rounded-full border border-red-200 px-5 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              退出登录
            </button>
          </div>

          <form onSubmit={saveNickname} className="mt-6 flex flex-col gap-3 border-t border-[#eee9e4] pt-6 sm:flex-row">
            <input
              name="nickname"
              defaultValue={nickname}
              maxLength={20}
              className="flex-1 rounded-xl border border-[#e8e4df] bg-[#faf8f5] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c4753f]/20"
            />
            <button className="rounded-xl bg-[#5a7a6a] px-5 py-2.5 text-sm font-medium text-white">保存昵称</button>
          </form>
          {message && <p className="mt-2 text-sm text-[#5a7a6a]">{message}</p>}
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {['我的收藏', '我的课程', '我的订单', '健康档案'].map((item) => (
            <section key={item} className="rounded-2xl border border-[#e8e4df] bg-white px-4 py-5 text-center shadow-sm">
              <h3 className="text-sm font-semibold text-[#2d2a26]">{item}</h3>
              <p className="mt-1 text-xs text-[#9a9590]">暂无内容</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
