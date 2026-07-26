import dotenv from "dotenv";
import { RecentTracks, UserInfo } from "./types.js";

dotenv.config({ quiet: true });

const API_KEY = process.env.LASTFM_KEY;

const API_URL = "https://ws.audioscrobbler.com/2.0/";
const RECENT_TRACKS_URL = `${API_URL}?method=user.getrecenttracks`;
const USER_INFO_URL = `${API_URL}?method=user.getinfo`;

export async function getRecentTracks(
  user: string,
  limit: number | null = 50,
): Promise<RecentTracks> {
  if (!API_KEY) {
    throw Error("env var LASTFM_KEY not set!");
  }

  if (limit === null || limit < 1) limit = 1;

  let fetch_url = `${RECENT_TRACKS_URL}&user=${user}&api_key=${API_KEY}&format=json&limit=${limit}`;
  const response = await fetch(fetch_url, {
    headers: { "User-Agent": "wireless.fish-backend/1.0 (https://wireless.fish)" },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Last.fm API error: ${response.status} ${response.statusText} — ${body}`,
    );
  }

  return await response.json();
}

export async function getUserInfo(user: string): Promise<UserInfo> {
  if (!API_KEY) {
    throw Error("env var LASTFM_KEY not set!");
  }

  if (!user) {
    throw Error("No user specified");
  }

  let fetch_url = `${USER_INFO_URL}&user=${user}&api_key=${API_KEY}&format=json`;
  const response = await fetch(fetch_url, {
    headers: { "User-Agent": "wireless.fish-backend/1.0 (https://wireless.fish)" },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Last.fm API error: ${response.status} ${response.statusText} — ${body}`,
    );
  }

  return await response.json();
}
