import express from "express";
import { getMessages, insertMessage } from "./guestbook_database.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ quiet: true });

const DEV_ENV = process.env.DEV_ENV;

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

app.get("/", (req, res): void => {
  res.json("Hello, api!");
});

app.get("/guestbook", (req, res) => {
  // make sure request body is defined
  if (!req.body) {
    req.body = {};
  }

  let { page } = req.body;

  page = Number(page);
  if (page < 0 || Number.isNaN(page)) {
    page = 0;
  }

  getMessages(page).then((data) => {
    let response = {
      count: data.length,
      entries: data,
    };

    res.json(response);
  });
});

app.post("/guestbook", (req, res) => {
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

  res.sendStatus(200);
});

if (DEV_ENV == "true") {
  app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
  });
}

export default app;
