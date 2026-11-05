// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Question } from "../src/shared/types";
import { setup } from "./helpers";
import { question, renderApp } from "./web-helpers";

function seed() {
  const context = setup();
  context.insert({ text: "middle", votes: 5, createdAt: "2026-01-01 12:00:00" });
  context.insert({ text: "popular", votes: 9, createdAt: "2026-01-01 10:00:00" });
  context.insert({ text: "recent", votes: 1, createdAt: "2026-01-01 14:00:00" });
  return context;
}

async function textsFor(app: ReturnType<typeof setup>["app"], sort: string) {
  const response = await app.request(`/api/questions?sort=${sort}`);
  return ((await response.json()) as Question[]).map(({ text }) => text);
}

describe("sorting API", () => {
  it("orders by most votes for top", async () => {
    const { app } = seed();

    expect(await textsFor(app, "top")).toEqual(["popular", "middle", "recent"]);
  });

  it("orders by most recent for newest", async () => {
    const { app } = seed();

    expect(await textsFor(app, "newest")).toEqual(["recent", "middle", "popular"]);
  });
});

describe("sorting UI", () => {
  it("requests the order for the selected tab", async () => {
    const { calls } = renderApp([question()]);
    await screen.findByText("A question");

    fireEvent.click(screen.getByRole("button", { name: "Newest" }));
    await waitFor(() => expect(calls.at(-1)?.url).toContain("sort=newest"));

    fireEvent.click(screen.getByRole("button", { name: "Top" }));
    await waitFor(() => expect(calls.at(-1)?.url).toContain("sort=top"));
  });
});
