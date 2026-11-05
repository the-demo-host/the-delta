import type { Db } from "./db";

const SAMPLE_QUESTIONS = [
  { text: "Does it work with monorepos?", author: "Anonymous", votes: 3, minutesAgo: 8 },
  { text: "How do you handle merge conflicts?", author: "Ana", votes: 14, minutesAgo: 2 },
  { text: "Can agents and humans share a task?", author: "Ben", votes: 9, minutesAgo: 5 },
];

export function seedIfEmpty(db: Db): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM questions").get() as {
    count: number;
  };
  if (count > 0) return;

  const insert = db.prepare(
    "INSERT INTO questions (text, author, votes, created_at) VALUES (?, ?, ?, datetime('now', ?))",
  );
  for (const { text, author, votes, minutesAgo } of SAMPLE_QUESTIONS) {
    insert.run(text, author, votes, `-${minutesAgo} minutes`);
  }
}
