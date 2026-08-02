import Database from "better-sqlite3";
import config from "../config/index.js";
import { initializeSchema } from "./schema.js";

const db = new Database(config.databasePath);

initializeSchema(db);

export default db;
