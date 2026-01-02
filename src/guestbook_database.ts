import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Database } from "./guestbook_supabase.types.js";

dotenv.config({ quiet: true });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL) {
  throw new Error("env var SUPABASE_URL is not set!");
}

if (!SUPABASE_KEY) {
  throw new Error("env var SUPABASE_KEY is not set!");
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

export async function getMessages() {
  const { data, error } = await supabase.from("messages").select();

  if (error) {
    console.log(error);
  }

  return data;
}

export async function insertMessage(name: string, content: string, reply: number | null) {
  const { error } = await supabase.from("messages").insert({ name: name, content: content, reply_to: reply });

  if (error) {
    console.log(error);
  }
}
