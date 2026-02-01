import dotenv from "dotenv";
import Database from "better-sqlite3";
import { Message, Ntfy, MessageInsert, NtfyInsert, MessageWithReplies } from "./types.js";

dotenv.config({ quiet: true });

const DB_PATH = process.env.DB_PATH;
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

if (!DB_PATH) {
  throw new Error("env var DB_PATH is not set!");
}

export function insertNotification(text: string) {
  const msg: NtfyInsert = {
    text: text,
  };

  db.prepare("INSERT INTO ntfy (text) VALUES (?)").run(msg.text);
}

export function getMessages() {
  const rows = db
    .prepare("SELECT id, created, name, content, site FROM messages WHERE visible = 1")
    .all() as Message[];
  return rows;
}

export function getMessageReplies(id: number) {
  const rows = db
    .prepare(
      "SELECT id, created, name, content, site FROM messages WHERE visible = 1 AND reply_to = ? ORDER BY created DESC",
    )
    .all(id) as Message[];

  return rows;
}

export function getMessageData() {
  let data = getMessages();
  let response = {
    count: data.length,
    entries: data as MessageWithReplies[],
  };

  for (const message of response.entries) {
    let replies = getMessageReplies(message.id);
    message.replies = replies;
    message.reply_count = replies.length;
  }

  return response;
}

export function insertMessage(
  name: string,
  content: string,
  reply: number | null,
  site: string | null,
) {
  const msg: MessageInsert = {
    name: name,
    content: content,
    reply_to: reply,
    site: site,
  };

  db.prepare("INSERT INTO messages (name, content, reply_to, site) VALUES (?, ?, ?, ?)").run(
    msg.name,
    msg.content,
    msg.reply_to,
    msg.site,
  );
}
