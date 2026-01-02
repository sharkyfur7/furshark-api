import express from "express";
import { getMessages, insertMessage } from "./guestbook_database.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const app = express();
const port = 3000;
app.use(express.json());

app.get("/", (req, res): void => {
  console.log(req.body);
  res.json("Hello, api!");
});

app.get("/guestbook", (req, res) => {
  getMessages().then((data) => {
    res.json(data);
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

app.listen(port, () => {
  if (process.env.DEV_ENV == "true") {
    console.log(`Listening on port http://localhost:${port}`);
  }
});
