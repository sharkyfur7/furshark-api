import dotenv from "dotenv";

dotenv.config({ quiet: true });

const API_KEY = process.env.LASTFM_KEY;
const API_URL = "https://ws.audioscrobbler.com/2.0/";

const ALLOWED_METHODS = new Set([
  "user.getRecentTracks",
  "user.getInfo",
  "user.getTopAlbums",
  "user.getTopArtists",
  "user.getTopTracks",
]);

export async function proxyLastFm(
  method: string,
  queryParams: Record<string, string>,
): Promise<unknown> {
  if (!API_KEY) {
    throw new Error("env var LASTFM_KEY not set!");
  }

  if (!ALLOWED_METHODS.has(method)) {
    throw new Error(`Method "${method}" is not allowed`);
  }

  const params = new URLSearchParams(queryParams);
  params.set("method", method);
  params.set("api_key", API_KEY);
  params.set("format", "json");

  const url = `${API_URL}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "wireless.fish-backend/1.0 (https://wireless.fish)",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Last.fm API error: ${response.status} ${response.statusText} — ${body}`,
    );
  }

  return await response.json();
}
