export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isKnownInviteCode(code: string): boolean {
  const match = /^STELLA-(\d{3})$/.exec(normalizeInviteCode(code));
  if (!match) return false;
  const number = Number(match[1]);
  return number >= 1 && number <= 30;
}
