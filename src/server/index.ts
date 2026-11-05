import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./app";
import { openDb } from "./db";
import { DB_PATH, PROGRESS_PATH } from "./paths";
import { seedIfEmpty } from "./seed";

const port = Number(process.env.PORT ?? 3000);
const hostKey = process.env.HOST_KEY ?? randomBytes(12).toString("hex");

const db = openDb(DB_PATH);
seedIfEmpty(db);

const app = createApp(db, { hostKey, progressPath: PROGRESS_PATH });

// Serve the built web app when one exists. In development, Vite serves it instead.
if (existsSync("dist/index.html")) {
  app.use("*", serveStatic({ root: "./dist" }));
  app.get("*", (c) => c.html(readFileSync("dist/index.html", "utf8")));
}

serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Host key: ${hostKey}`);
});
