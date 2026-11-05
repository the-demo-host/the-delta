import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Question } from "../shared/types";

export type Db = DatabaseSync;

const SELECT_QUESTION = `
  SELECT id, text, author, votes, status, created_at AS createdAt
  FROM questions
`;

export function openDb(path: string): Db {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      votes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  return db;
}

export function listQuestions(db: Db): Question[] {
  return db.prepare(`${SELECT_QUESTION} ORDER BY id`).all() as unknown as Question[];
}

export function createQuestion(db: Db, text: string, author: string): Question {
  const { lastInsertRowid } = db
    .prepare("INSERT INTO questions (text, author) VALUES (?, ?)")
    .run(text, author);

  return db
    .prepare(`${SELECT_QUESTION} WHERE id = ?`)
    .get(lastInsertRowid) as unknown as Question;
}
