interface WindowEntry {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, WindowEntry>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  constructor(
    limit: number,
    windowMs: number,
    now: () => number = Date.now
  ) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  allow(key: string): boolean {
    const currentTime = this.now();
    const current = this.entries.get(key);

    if (!current || currentTime >= current.resetAt) {
      this.entries.set(key, { count: 1, resetAt: currentTime + this.windowMs });
      return true;
    }
    if (current.count >= this.limit) return false;

    current.count += 1;
    return true;
  }
}
