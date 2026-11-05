# Live Q&A

A web app where an audience can post questions during a talk or workshop and upvote the ones they most want answered.

Live Q&A is a mock project for a developer workshop on programming in unison. Attendees complete the app together during the session, then use the finished app to ask real questions.

> **Status:** The core app works: people can post questions and see them listed. The other features are deliberately unfinished for attendees to complete. See [TODO.md](TODO.md) for what's left.

## The finished app

Attendees open a shared link and see one page:

```
┌────────────────────────────────────────────────┐
│  Live Q&A · Programming in Unison Workshop     │
│                                                │
│  [ Ask a question...                 ] [ Post ]│
│                                                │
│  [ Top ]  [ Newest ]                           │
│                                                │
│  ▲ 14  How do you handle merge conflicts?      │
│        Ana · 2 min ago                         │
│                                                │
│  ▲ 9   Can agents and humans share a task?     │
│        Ben · 5 min ago                         │
│                                                │
│  ▲ 3   Does it work with monorepos?            │
│        Anonymous · 8 min ago                   │
└────────────────────────────────────────────────┘
```

## Who uses it

- **Attendees** post questions, upvote questions and watch the list change live.
- **The host** moderates questions and uses the list to decide what to answer next.
- **The facilitator** runs the workshop, follows progress and resets the project between sessions.

## Constraints

- **Browser only:** attendees don't install or run anything on their own machines.
- **No accounts:** attendees can post and vote without signing up.
- **Phone friendly:** the app works on a phone as well as a laptop.
- **Self-contained:** the app doesn't depend on paid or third-party services.
- **Workshop sized:** the app needs to handle one room of people, not public-scale traffic.

## Running the project

These commands are for whoever hosts the workshop, not for attendees. They require Node.js 24 or later.

| Command | What it does |
|---------|--------------|
| `npm install` | Installs dependencies. |
| `npm run dev` | Starts the app in development mode at http://localhost:5173 and reruns the tests on every change. |
| `npm start` | Runs the tests, builds the app and serves it at http://localhost:3000. |
| `npm test` | Runs all tests once. The feature tests fail until those features are finished. |
| `npm run typecheck` | Checks the TypeScript types. |
| `npm run reset` | Restores the sample questions and deletes everything else in the database. Stop the app first. |

The progress page is at `/progress`.

### Settings

| Environment variable | Default | Purpose |
|----------------------|---------|---------|
| `PORT` | `3000` | Port for the API and the built app. |
| `HOST_KEY` | Random, printed at startup | Secret that identifies the host. |
| `DB_PATH` | `data/live-qa.db` | Location of the database file. |

## Project layout

| Path | Contents |
|------|----------|
| `src/server` | API and database |
| `src/web` | Web pages |
| `src/shared` | Types used by both the server and the web pages |
| `tests` | One test file per feature, which also feeds the progress page |
