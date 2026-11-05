import { useEffect, useState } from "react";
import type { FeatureProgress, Progress } from "../shared/types";
import { fetchProgress } from "./api";

const POLL_INTERVAL_MS = 5000;

function isDone({ passed, total }: FeatureProgress): boolean {
  return total > 0 && passed === total;
}

export function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setProgress(await fetchProgress());
        setError(null);
      } catch (cause) {
        setError((cause as Error).message);
      }
    }

    void load();
    const timer = setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const features = progress?.features ?? [];
  const doneCount = features.filter(isDone).length;

  return (
    <main className="page page-wide">
      <header className="masthead">
        <h1>Workshop progress</h1>
        {progress?.updatedAt ? (
          <p>
            {doneCount} of {features.length} done · Last test run{" "}
            {new Date(progress.updatedAt).toLocaleTimeString()}
          </p>
        ) : (
          <p>No test results yet.</p>
        )}
      </header>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <ul className="progress-list">
        {features.map((feature) => (
          <li key={feature.id} className="progress-row" data-done={isDone(feature)}>
            <span className="progress-mark" aria-hidden="true">
              {isDone(feature) ? "✓" : "○"}
            </span>
            <span className="progress-title">{feature.title}</span>
            <span className="progress-count">
              {feature.passed} of {feature.total} tests
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
