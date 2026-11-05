import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { createApp } from "./app";
import { openDb } from "./db";
import { DB_PATH, PROGRESS_PATH } from "./paths";
import { seedIfEmpty } from "./seed";

const BASE_PATH = "/live";
const INDEX_PATH = "dist/index.html";

const port = Number(process.env.PORT ?? 3000);
const hostKey = process.env.HOST_KEY ?? randomBytes(12).toString("hex");

const db = openDb(DB_PATH);
seedIfEmpty(db);

const server = new Hono();
server.route(BASE_PATH, createApp(db, { hostKey, progressPath: PROGRESS_PATH }));

// Serve the built web pages. In development, Vite serves them instead.
server.use(
  `${BASE_PATH}/*`,
  serveStatic({
    root: "./dist",
    rewriteRequestPath: (path) => path.slice(BASE_PATH.length),
  }),
);
server.get(`${BASE_PATH}/*`, (c) =>
  existsSync(INDEX_PATH)
    ? c.html(readFileSync(INDEX_PATH, "utf8"))
    : c.text("The app is still building. Try again in a moment.", 503),
);
server.get("*", (c) => c.redirect(`${BASE_PATH}/`));

serve({ fetch: server.fetch, hostname: "127.0.0.1", port }, () => {
  console.log(`Listening on http://localhost:${port}${BASE_PATH}/`);
  console.log(`Host key: ${hostKey}`);
});
