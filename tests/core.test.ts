import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { openDb } from "../src/server/db";
import { seedIfEmpty } from "../src/server/seed";
import { readProgress } from "../src/server/progress";
import { setup } from "./helpers";

describe("posting questions", () => {
  it("adds a posted question to the list", async () => {
    const { post, list } = setup();

    const response = await post("Is this on?", "Ana");

    expect(response.status).toBe(201);
    expect(await list()).toMatchObject([
      { text: "Is this on?", author: "Ana", votes: 0, status: "open" },
    ]);
  });

  it("posts as Anonymous when no name is given", async () => {
    const { post, list } = setup();

    await post("Who am I?");

    expect((await list())[0].author).toBe("Anonymous");
  });

  it("trims surrounding whitespace", async () => {
    const { post, list } = setup();

    await post("  Spaces?  ", "  Ben  ");

    expect(await list()).toMatchObject([{ text: "Spaces?", author: "Ben" }]);
  });

  it.each([
    ["empty text", ""],
    ["whitespace-only text", "   "],
    ["text over the limit", "x".repeat(281)],
  ])("rejects %s", async (_name, text) => {
    const { post, list } = setup();

    expect((await post(text)).status).toBe(400);
    expect(await list()).toEqual([]);
  });

  it("rejects a name over the limit", async () => {
    const { post } = setup();

    expect((await post("Too long?", "x".repeat(41))).status).toBe(400);
  });

  it("rejects a body that isn't JSON", async () => {
    const { app } = setup();

    const response = await app.request("/api/questions", { method: "POST", body: "nope" });

    expect(response.status).toBe(400);
  });
});

describe("sample questions", () => {
  it("seeds an empty database", async () => {
    const { db, list } = setup();

    seedIfEmpty(db);

    expect(await list()).toHaveLength(3);
  });

  it("leaves existing questions alone", async () => {
    const { db, insert, list } = setup();
    insert();

    seedIfEmpty(db);

    expect(await list()).toHaveLength(1);
  });
});

describe("database file", () => {
  it("is writable by every user", () => {
    const directory = mkdtempSync(join(tmpdir(), "live-qa-"));
    const path = join(directory, "test.db");

    try {
      openDb(path).close();
      expect(statSync(path).mode & 0o777).toBe(0o666);
    } finally {
      rmSync(directory, { recursive: true });
    }
  });
});

describe("progress", () => {
  it("reports nothing when no tests have run", () => {
    const progress = readProgress("missing-progress.json");

    expect(progress.updatedAt).toBeNull();
    expect(progress.features.every(({ total }) => total === 0)).toBe(true);
  });

  it("counts passing tests per feature", () => {
    const directory = mkdtempSync(join(tmpdir(), "live-qa-"));
    const path = join(directory, "progress.json");
    writeFileSync(
      path,
      JSON.stringify({
        testResults: [
          {
            name: "/repo/tests/upvotes.test.tsx",
            assertionResults: [{ status: "passed" }, { status: "failed" }],
          },
        ],
      }),
    );

    try {
      const upvotes = readProgress(path).features.find(({ id }) => id === "upvotes");
      expect(upvotes).toMatchObject({ passed: 1, total: 2 });
    } finally {
      rmSync(directory, { recursive: true });
    }
  });
});
