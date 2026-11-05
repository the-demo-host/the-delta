import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";
import type { FeatureProgress, Progress } from "../shared/types";

const FEATURES = [
  { id: "core", title: "Core app" },
  { id: "upvotes", title: "Upvotes" },
  { id: "sorting", title: "Sorting" },
  { id: "live-updates", title: "Live updates" },
  { id: "moderation", title: "Moderation" },
  { id: "question-age", title: "Question age" },
];

interface TestReport {
  testResults?: {
    name: string;
    assertionResults: { status: string }[];
  }[];
}

function readReport(path: string): TestReport | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as TestReport;
  } catch {
    return null;
  }
}

export function readProgress(path: string): Progress {
  const report = readReport(path);

  const features: FeatureProgress[] = FEATURES.map(({ id, title }) => {
    const assertions = (report?.testResults ?? [])
      .filter((file) => basename(file.name).split(".")[0] === id)
      .flatMap((file) => file.assertionResults);

    return {
      id,
      title,
      passed: assertions.filter((assertion) => assertion.status === "passed").length,
      total: assertions.length,
    };
  });

  return {
    features,
    // The report's own start time doesn't change between reruns in watch mode.
    updatedAt: report ? statSync(path).mtime.toISOString() : null,
  };
}
