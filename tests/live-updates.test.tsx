// @vitest-environment jsdom
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HOST_KEY, setup } from "./helpers";
import { FakeEventSource, question, renderApp } from "./web-helpers";

const EVENT_TIMEOUT_MS = 1000;

/** Opens the event stream and resolves once a new event follows `action`. */
async function eventAfter(
  context: ReturnType<typeof setup>,
  action: () => unknown,
): Promise<boolean> {
  const response = await context.app.request("/api/events");
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toContain("text/event-stream");

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let received = "";
  const pump = (async () => {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      received += decoder.decode(value, { stream: true });
    }
  })().catch(() => {});

  // Anything sent on connect doesn't count as a reaction to the change.
  await new Promise((resolve) => setTimeout(resolve, 50));
  const alreadyReceived = received.length;

  await action();

  const deadline = Date.now() + EVENT_TIMEOUT_MS;
  let found = false;
  while (!found && Date.now() < deadline) {
    found = received.slice(alreadyReceived).includes("data:");
    if (!found) await new Promise((resolve) => setTimeout(resolve, 10));
  }

  await reader.cancel();
  await pump;
  return found;
}

describe("live updates API", () => {
  it("sends an event when a question is posted", async () => {
    const context = setup();

    expect(await eventAfter(context, () => context.post("Hello?"))).toBe(true);
  });

  it("sends an event when a vote is added", async () => {
    const context = setup();
    const id = context.insert();

    expect(await eventAfter(context, () => context.vote(id, "visitor-a"))).toBe(true);
  });

  it("sends an event when a question is moderated", async () => {
    const context = setup();
    const id = context.insert();

    expect(await eventAfter(context, () => context.setStatus(id, "answered", HOST_KEY))).toBe(true);
  });
});

describe("live updates UI", () => {
  it("subscribes to the event stream", async () => {
    renderApp([question()]);

    await waitFor(() => {
      expect(FakeEventSource.instances.map(({ url }) => url)).toContain("/api/events");
    });
  });
});
