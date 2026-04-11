import express from "express";
import {
  backup,
  getMessageData,
  insertMessage,
  insertNotification,
} from "./database.js";
import dotenv from "dotenv";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import * as cron from "node-cron";
import { getRecentTracks, getUserInfo } from "./lastfm.js";

dotenv.config({ quiet: true });
const DEV_ENV = process.env.DEV_ENV;
const NTFY_BACKEND = process.env.NTFY_BACKEND;
const NTFY_MOBILE = process.env.NTFY_MOBILE;

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());
app.set("trust proxy", 1);

if (!NTFY_BACKEND) {
  throw new Error("No NTFY_BACKEND env variable!");
} else if (!NTFY_MOBILE) {
  throw new Error("No NTFY_MOBILE env variable!");
}

if (!DEV_ENV) {
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
  });

  app.use(limiter);
}

async function notify(url: string, msg: string) {
  let resp = await fetch(url, {
    method: "POST", // PUT works too
    body: msg,
    headers: {
      "Content-Type": "text/plain",
      "User-Agent": "vercel-serverless",
    },
  });

  if (!resp.ok) {
    throw new Error(
      `Error trying to send ntfy.sh notification (${resp.status}). ${await resp.json()}`,
    );
  }
}

app.get("/", (req, res): void => {
  res.status(200).json("I am alive.");
});

app.get("/guestbook", (req, res) => {
  res.json(getMessageData());
});

app.get("/lastfm", async (req, res) => {
  const lastfm_res = await fetch("https://ws.audioscrobbler.com/2.0/");

  if (lastfm_res.status < 500) {
    res.status(200).json(`lastfm's api seems to be running!`);
  } else {
    res
      .status(502)
      .json(`lastfm's api seems to be down, (response ${lastfm_res.status})`);
  }
});

// Recent tracks from last.fm
app.get("/lastfm/recent", async (req, res) => {
  if (!req.query.user) {
    res.status(400).json("`user` query is missing");
    return;
  }

  const user = req.query.user.toString();
  const limit = Number(req.query.limit);

  try {
    res.status(200).json(await getRecentTracks(user, limit));
  } catch (e) {
    res.status(500).json("Internal server error while getting recent tracks");
    throw e;
  }
});

// Get user information
app.get("/lastfm/info", async (req, res) => {
  if (!req.query.user) {
    res.status(400).json("`user` query is missing");
    return;
  }

  try {
    const user = req.query.user.toString();
    res.status(200).json(await getUserInfo(user));
  } catch (e) {
    res.status(500).json("Internal server error while getting user info");
    throw e;
  }
});

app.post("/guestbook", async (req, res) => {
  if (!req.body) {
    res.status(400).json("ERROR: request has no body");
    return;
  }

  if (!req.body.name) {
    res.status(400).json("ERROR: missing `name`");
    return;
  }

  if (!req.body.content) {
    res.status(400).json("ERROR: missing `content`");
    return;
  }

  const { name, content } = req.body;
  let reply_to = null;
  if (req.body.reply_to) {
    reply_to = Number(req.body.reply_to);
  }
  let site = null;
  if (req.body.site) {
    try {
      site = new URL(req.body.site).toString();
    } catch {
      res.status(400).json("ERROR: invalid site url");
      return;
    }
  }

  insertMessage(name, content, reply_to, site);
  await notify(
    NTFY_BACKEND,
    `[${new Date().toLocaleDateString()}] New guestbook comment by "${name}"`,
  );
  res.sendStatus(200);
});

app.post("/ntfy", async (req, res) => {
  if (!req.body) {
    res.status(400).json("ERROR: request has no body");
    return;
  }

  if (!req.body.text) {
    res.status(400).json("ERROR: missing `text`");
    return;
  }

  try {
    insertNotification(req.body.text);
    await notify(NTFY_MOBILE, req.body.text);
    res.sendStatus(200);
  } catch (e) {
    console.error("Error in /ntfy endpoint:", e);
    res.status(500).json("ERROR: Failed to process notification");
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port http://localhost:${port}`);
});

cron.schedule("0 2 * * Sunday", async () => {
  console.log("[CRON] Initiating weekly backup");

  try {
    await backup();
    console.log("[CRON] Weekly backup completed successfully");
  } catch (error) {
    console.error("[CRON] Weekly backup failed:", error);
  }
});

console.log("Init database backup");
await backup();

export default app;
