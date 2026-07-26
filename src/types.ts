// Database types
export interface Message {
  id: number;
  created: string; // ISO timestamp
  name: string;
  content: string;
  reply_to: number | null;
  visible: number; // 0 or 1 (SQLite boolean)
  site: string | null;
}

export interface MessageWithReplies extends Message {
  replies: Message[]; // or MessageWithReplies[] if nested
  reply_count: number;
}

export interface Ntfy {
  id: number;
  date: string; // ISO timestamp
  text: string;
}

// For inserts (omit auto-generated fields)
export interface MessageInsert {
  name: string;
  content: string;
  reply_to?: number | null;
  visible?: number;
  site?: string | null;
  created?: string;
}

export interface NtfyInsert {
  text: string;
  date?: string;
}


