import { describe, expect, it } from "vitest";
import { formatAge } from "../src/web/time";
import { setup } from "./helpers";

async function ageOf(sqliteOffset: string): Promise<string> {
  const { db, list } = setup();
  db.prepare(
    "INSERT INTO questions (text, author, created_at) VALUES ('Q', 'A', datetime('now', ?))",
  ).run(sqliteOffset);

  return formatAge((await list())[0].createdAt);
}

describe("question age", () => {
  it("shows a brand new question as just now", async () => {
    const { post, list } = setup();

    await post("Fresh?");

    expect(formatAge((await list())[0].createdAt)).toBe("just now");
  });

  it("shows minutes", async () => {
    expect(await ageOf("-2 minutes")).toBe("2 min ago");
  });

  it("shows hours", async () => {
    expect(await ageOf("-3 hours")).toBe("3h ago");
  });

  it("shows days", async () => {
    expect(await ageOf("-2 days")).toBe("2d ago");
  });
});
