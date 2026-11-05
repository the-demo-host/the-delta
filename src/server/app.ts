import { Hono } from "hono";
import type { NewQuestion } from "../shared/types";
import { createQuestion, listQuestions, type Db } from "./db";
import { readProgress } from "./progress";

const MAX_TEXT_LENGTH = 280;
const MAX_AUTHOR_LENGTH = 40;

export interface AppOptions {
  hostKey: string;
  progressPath: string;
}

export function createApp(db: Db, options: AppOptions) {
  const app = new Hono();

  app.get("/api/questions", (c) => c.json(listQuestions(db)));

  app.post("/api/questions", async (c) => {
    const body = (await c.req.json().catch(() => null)) as Partial<NewQuestion> | null;
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const author = typeof body?.author === "string" ? body.author.trim() : "";

    if (!text) {
      return c.json({ error: "A question can't be empty." }, 400);
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return c.json({ error: `Questions are limited to ${MAX_TEXT_LENGTH} characters.` }, 400);
    }
    if (author.length > MAX_AUTHOR_LENGTH) {
      return c.json({ error: `Names are limited to ${MAX_AUTHOR_LENGTH} characters.` }, 400);
    }

    return c.json(createQuestion(db, text, author || "Anonymous"), 201);
  });

  app.post("/api/questions/:id/vote", (c) => c.json({ error: "Not implemented" }, 501));

  app.patch("/api/questions/:id/status", (c) => c.json({ error: "Not implemented" }, 501));

  app.get("/api/events", (c) => c.json({ error: "Not implemented" }, 501));

  app.get("/api/progress", (c) => c.json(readProgress(options.progressPath)));

  return app;
}
