import { useEffect, useState, type FormEvent } from "react";
import type { Question, SortOrder } from "../shared/types";
import { fetchQuestions, postQuestion } from "./api";
import { formatAge } from "./time";

const EVENT_NAME = "Programming in Unison Workshop";

const SORT_TABS: { value: SortOrder; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "newest", label: "Newest" },
];

export function App() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [sort, setSort] = useState<SortOrder>("top");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setQuestions(await fetchQuestions());
      setError(null);
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPosting(true);
    try {
      await postQuestion({ text, author });
      setText("");
      await load();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="page">
      <header className="masthead">
        <h1>Live Q&amp;A</h1>
        <p>{EVENT_NAME}</p>
      </header>

      <form className="ask" onSubmit={handleSubmit}>
        <label className="ask-question">
          <span>Your question</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Ask a question..."
            maxLength={280}
            rows={2}
            required
          />
        </label>
        <div className="ask-footer">
          <label className="ask-name">
            <span>Name (optional)</span>
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Anonymous"
              maxLength={40}
            />
          </label>
          <button type="submit" className="post" disabled={posting || !text.trim()}>
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="tabs" role="group" aria-label="Sort questions">
        {SORT_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="tab"
            aria-pressed={sort === value}
            onClick={() => setSort(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {questions === null && !error && <p className="notice">Loading questions...</p>}
      {questions?.length === 0 && <p className="notice">No questions yet. Ask the first one!</p>}

      <ul className="questions">
        {questions?.map((question) => (
          <li key={question.id} className="question">
            <button
              type="button"
              className="vote"
              aria-label={`Upvote: ${question.text}`}
            >
              <span aria-hidden="true">▲</span>
              <span>{question.votes}</span>
            </button>
            <div>
              <p className="question-text">{question.text}</p>
              <p className="question-meta">
                {question.author} · {formatAge(question.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
