// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HOST_KEY, setup } from "./helpers";
import { question, renderApp } from "./web-helpers";

describe("moderation API", () => {
  it("removes a hidden question from the attendee list", async () => {
    const { insert, setStatus, list } = setup();
    const id = insert({ text: "Spam" });
    insert({ text: "Real question" });

    expect((await setStatus(id, "hidden", HOST_KEY)).status).toBe(200);

    expect((await list()).map(({ text }) => text)).toEqual(["Real question"]);
  });

  it("keeps an answered question in the list, marked as answered", async () => {
    const { insert, setStatus, list } = setup();
    const id = insert();

    expect((await setStatus(id, "answered", HOST_KEY)).status).toBe(200);

    expect((await list())[0].status).toBe("answered");
  });

  it("rejects a request with no host key", async () => {
    const { insert, setStatus, list } = setup();
    const id = insert();

    expect((await setStatus(id, "hidden")).status).toBe(403);
    expect(await list()).toHaveLength(1);
  });

  it("rejects a request with the wrong host key", async () => {
    const { insert, setStatus, list } = setup();
    const id = insert();

    expect((await setStatus(id, "hidden", "wrong-key")).status).toBe(403);
    expect(await list()).toHaveLength(1);
  });

  it("rejects an unknown status", async () => {
    const { insert, setStatus } = setup();

    expect((await setStatus(insert(), "deleted", HOST_KEY)).status).toBe(400);
  });

  it("returns 404 for an unknown question", async () => {
    const { setStatus } = setup();

    expect((await setStatus(999, "hidden", HOST_KEY)).status).toBe(404);
  });
});

describe("moderation UI", () => {
  it("shows attendees which questions were answered", async () => {
    renderApp([question({ status: "answered" })]);

    expect(await screen.findByText(/answered/i)).toBeTruthy();
  });

  it("hides the host controls from attendees", async () => {
    renderApp([question()]);
    await screen.findByText("A question");

    expect(screen.queryByRole("button", { name: /hide/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /answered/i })).toBeNull();
  });

  it("lets the host hide a question using the key from the URL", async () => {
    window.history.pushState({}, "", `/?host=${HOST_KEY}`);
    const { calls } = renderApp([question({ id: 7 })]);

    fireEvent.click(await screen.findByRole("button", { name: /hide/i }));

    await waitFor(() => {
      const call = calls.find(({ method }) => method === "PATCH");
      expect(call?.url).toBe("/api/questions/7/status");
      expect(call?.headers.get("X-Host-Key")).toBe(HOST_KEY);
    });
  });

  it("lets the host mark a question as answered", async () => {
    window.history.pushState({}, "", `/?host=${HOST_KEY}`);
    const { calls } = renderApp([question({ id: 7 })]);

    fireEvent.click(await screen.findByRole("button", { name: /answered/i }));

    await waitFor(() => {
      expect(calls.find(({ method }) => method === "PATCH")?.url).toBe("/api/questions/7/status");
    });
  });
});
