import db from "../database/db.js";

export function getStatus() {
  return {
    databaseQuery: () => {
      const row = db.prepare("SELECT sqlite_version() AS version").get();
      return row && row.version;
    },
  };
}
