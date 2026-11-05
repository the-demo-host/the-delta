import { createApp } from "../src/server/app";
import { openDb, type Db } from "../src/server/db";
import type { Question } from "../src/shared/types";

export const HOST_KEY = "test-host-key";

interface SeedQuestion {
  text?: string;
  author?: string;
  votes?: number;
  status?: string;
  createdAt?: string;
}

export function setup(progressPath = "missing-progress.json") {
  const db = openDb(":memory:");
  const app = createApp(db, { hostKey: HOST_KEY, progressPath });

  return {
    db,
    app,
    insert: (question: SeedQuestion = {}) => insertQuestion(db, question),
    list: async () => (await (await app.request("/api/questions")).json()) as Question[],
    post: (text: string, author?: string) =>
      app.request("/api/questions", {
        method: "POST",
        body: JSON.stringify({ text, author }),
      }),
    vote: (id: number, visitorId?: string) =>
      app.request(`/api/questions/${id}/vote`, {
        method: "POST",
        headers: visitorId ? { "X-Visitor-Id": visitorId } : {},
      }),
    setStatus: (id: number, status: string, hostKey?: string) =>
      app.request(`/api/questions/${id}/status`, {
        method: "PATCH",
        headers: hostKey ? { "X-Host-Key": hostKey } : {},
        body: JSON.stringify({ status }),
      }),
  };
}

export function insertQuestion(db: Db, question: SeedQuestion = {}): number {
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO questions (text, author, votes, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      question.text ?? "A question",
      question.author ?? "Anonymous",
      question.votes ?? 0,
      question.status ?? "open",
      question.createdAt ?? "2026-01-01 12:00:00",
    );
  return Number(lastInsertRowid);
}
