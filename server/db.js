import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sqlite3.verbose();

const dbFolder = path.join(__dirname, "database");

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder);
}

const dbPath = path.join(dbFolder, "wsms.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("✅ Connected to SQLite Database");
  }
});

export default db;