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
  const { name, content } = req.body;

  if (!name || !content) {
    res.status(400).json("ERROR: missing `name` or `content` parameters");
    return;
  }

  insertMessage(name, content, null);

  res.sendStatus(200);
});

if (DEV_ENV == "true") {
  app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
  });
}

export default app;
