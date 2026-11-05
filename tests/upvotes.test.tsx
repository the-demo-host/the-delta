// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setup } from "./helpers";
import { question, renderApp } from "./web-helpers";

describe("upvotes API", () => {
  it("adds a vote to a question", async () => {
    const { insert, vote, list } = setup();
    const id = insert();

    expect((await vote(id, "visitor-a")).status).toBe(200);

    expect((await list())[0].votes).toBe(1);
  });

  it("counts one vote per person per question", async () => {
    const { insert, vote, list } = setup();
    const id = insert();

    await vote(id, "visitor-a");
    await vote(id, "visitor-a");

    expect((await list())[0].votes).toBe(1);
  });

  it("counts votes from different people", async () => {
    const { insert, vote, list } = setup();
    const id = insert();

    await vote(id, "visitor-a");
    await vote(id, "visitor-b");

    expect((await list())[0].votes).toBe(2);
  });

  it("lets one person vote on different questions", async () => {
    const { insert, vote, list } = setup();
    const first = insert();
    const second = insert();

    await vote(first, "visitor-a");
    await vote(second, "visitor-a");

    expect((await list()).map(({ votes }) => votes)).toEqual([1, 1]);
  });

  it("rejects a vote with no visitor ID", async () => {
    const { insert, vote } = setup();

    expect((await vote(insert())).status).toBe(400);
  });

  it("returns 404 for an unknown question", async () => {
    const { vote } = setup();

    expect((await vote(999, "visitor-a")).status).toBe(404);
  });
});

describe("upvotes UI", () => {
  it("sends the vote when ▲ is clicked", async () => {
    const { calls } = renderApp([question({ id: 7, text: "Vote for me" })]);

    fireEvent.click(await screen.findByRole("button", { name: /upvote: vote for me/i }));

    await waitFor(() => {
      const call = calls.find(({ method }) => method === "POST");
      expect(call?.url).toBe("/api/questions/7/vote");
      expect(call?.headers.get("X-Visitor-Id")).toBeTruthy();
    });
  });
});
