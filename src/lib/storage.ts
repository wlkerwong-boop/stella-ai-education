// 对话历史本地存储管理

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "stella_chat_sessions";
const CURRENT_SESSION_KEY = "stella_current_session";

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 从对话内容生成标题（取第一条用户消息的前20字）
function generateTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (firstUserMsg) {
    return firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? "..." : "");
  }
  return "新对话";
}

// 获取所有会话
export function getAllSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 获取当前会话
export function getCurrentSession(): ChatSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(CURRENT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// 保存当前会话
export function saveCurrentSession(messages: ChatMessage[]): ChatSession {
  const existing = getCurrentSession();
  const session: ChatSession = {
    id: existing?.id || generateId(),
    title: existing?.title || generateTitle(messages),
    messages,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));

    // 同时更新到所有会话列表中
    const allSessions = getAllSessions();
    const idx = allSessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      allSessions[idx] = session;
    } else {
      allSessions.unshift(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions.slice(0, 50))); // 最多保留50个
  }

  return session;
}

// 开始新会话
export function startNewSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

// 获取所有对话消息（用于成长分析）
export function getAllMessages(): ChatMessage[] {
  const sessions = getAllSessions();
  return sessions.flatMap((s) => s.messages).sort((a, b) => a.timestamp - b.timestamp);
}

// 获取用户提问统计
export function getUserStats() {
  const allMessages = getAllMessages();
  const userMessages = allMessages.filter((m) => m.role === "user");

  return {
    totalQuestions: userMessages.length,
    totalConversations: getAllSessions().length,
    firstChatDate: userMessages.length > 0 ? userMessages[0].timestamp : null,
    latestChatDate: userMessages.length > 0 ? userMessages[userMessages.length - 1].timestamp : null,
  };
}
