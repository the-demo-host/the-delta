import type { NewQuestion, Progress, Question } from "../shared/types";

const VISITOR_ID_KEY = "live-qa-visitor-id";

let fallbackVisitorId: string | null = null;

function newVisitorId(): string {
  // crypto.randomUUID is unavailable on plain HTTP, so it can't be relied on here.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = newVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    fallbackVisitorId ??= newVisitorId();
    return fallbackVisitorId;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Visitor-Id": getVisitorId(),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Something went wrong. Please try again.");
  }
  return (await response.json()) as T;
}

export function fetchQuestions(): Promise<Question[]> {
  return request("/api/questions");
}

export function postQuestion(question: NewQuestion): Promise<Question> {
  return request("/api/questions", {
    method: "POST",
    body: JSON.stringify(question),
  });
}

export function fetchProgress(): Promise<Progress> {
  return request("/api/progress");
}
