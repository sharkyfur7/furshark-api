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

export interface RecentTracks {
  recenttracks: {
    "@attr": {
      page: string;
      total: string;
      user: string;
      perPage: string;
      totalPages: string;
    };
    track: Array<{
      "@attr"?: {
        nowplaying: "true";
      };
      artist: {
        mbid: string;
        "#text": string;
        url?: string;
        image?: Array<{
          size: "small" | "medium" | "large" | "extralarge";
          "#text": string;
        }>;
        name?: string;
      };
      album: {
        mbid: string;
        "#text": string;
      };
      image: Array<{
        size: "small" | "medium" | "large" | "extralarge";
        "#text": string;
      }>;
      streamable: "0" | "1";
      date?: {
        uts: string;
        "#text": string;
      };
      url: string;
      name: string;
      mbid: string;
      loved?: "0" | "1"; // only w/ extended=1
    }>;
  };
}

export interface UserInfo {
  user: {
    id: string;
    name: string;
    realname: string;
    url: string;
    image: string;
    country: string;
    age: string;
    gender: string;
    subscriber: string;
    playcount: string;
    playlists: string;
    bootstrap: string;
    registered: {
      unixtime: string;
      "#text": string;
    };
  };
}
