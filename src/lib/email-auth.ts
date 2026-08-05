export interface RegistrationInput {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function validatePassword(password: string): string | null {
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return '密码至少 8 位，且必须同时包含字母和数字';
  }
  return null;
}

export function validateRegistration(input: RegistrationInput): string | null {
  if (!isValidEmail(input.email)) return '请输入有效的邮箱地址';

  const passwordError = validatePassword(input.password);
  if (passwordError) return passwordError;

  if (input.password !== input.confirmPassword) return '两次输入的密码不一致';

  const nickname = input.nickname.trim();
  if (nickname.length < 2 || nickname.length > 20) {
    return '昵称长度需在 2-20 个字符之间';
  }

  return null;
}

export function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) return '邮箱或密码不正确';
  if (normalized.includes('email not confirmed')) return '请先前往邮箱完成验证';
  if (normalized.includes('user already registered')) return '该邮箱已注册，请直接登录';
  if (normalized.includes('over_email_send_rate_limit') || normalized.includes('email rate limit')) {
    return '验证邮件发送过于频繁，请稍后再试';
  }
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return '操作过于频繁，请稍后再试';
  }
  if (normalized.includes('weak password') || normalized.includes('password should be')) {
    return '密码强度不足，请使用至少 8 位且包含字母和数字的密码';
  }

  return '操作失败，请稍后重试';
}
