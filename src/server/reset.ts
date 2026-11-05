// Restores the sample questions. Stop the app before running this.
import { rmSync } from "node:fs";
import { openDb } from "./db";
import { DB_PATH } from "./paths";
import { seedIfEmpty } from "./seed";

for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${DB_PATH}${suffix}`, { force: true });
}

const db = openDb(DB_PATH);
seedIfEmpty(db);
db.close();

console.log(`Reset ${DB_PATH} to the sample questions.`);
