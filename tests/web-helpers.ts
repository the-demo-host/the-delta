import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";
import { App } from "../src/web/App";
import type { Question } from "../src/shared/types";

export interface ApiCall {
  url: string;
  method: string;
  headers: Headers;
}

export class FakeEventSource {
  static instances: FakeEventSource[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }

  addEventListener() {}
  removeEventListener() {}
  close() {}
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  FakeEventSource.instances = [];
  window.history.pushState({}, "", "/");
});

export function question(overrides: Partial<Question> = {}): Question {
  return {
    id: 1,
    text: "A question",
    author: "Anonymous",
    votes: 0,
    status: "open",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Renders the app against a fake API and records every request it makes. */
export function renderApp(questions: Question[]) {
  const calls: ApiCall[] = [];

  vi.stubGlobal("EventSource", FakeEventSource);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const method = init.method ?? "GET";
      calls.push({ url: String(input), method, headers: new Headers(init.headers) });
      return Response.json(method === "GET" ? questions : questions[0]);
    }),
  );

  return { calls, ...render(createElement(App)) };
}
