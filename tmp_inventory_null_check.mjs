import Database from "better-sqlite3";
import path from "path";
const dbPath = path.resolve("backend/data/wsms.db");
const db = new Database(dbPath, { readonly: true });
const fields = ["number", "numberType", "location", "history"];
for (const field of fields) {
  const count = db.prepare(`SELECT COUNT(*) AS count FROM inventory WHERE ${field} IS NULL`).get().count;
  console.log(`${field}: ${count}`);
}
console.log('ROWS WITH ANY NULL FIELD:');
const rows = db.prepare(`SELECT id, item, company, description, quantity, status, gpwNumber, policeStation, mobileVehicle, issueDate, receiveDate, remarks, number, numberType, location, faultReason, repairStatus, faultyDate, repairSentDate, repairedDate, UNSERVICEABLEDate, history FROM inventory WHERE number IS NULL OR numberType IS NULL OR location IS NULL OR history IS NULL ORDER BY id LIMIT 50`).all();
console.log(JSON.stringify(rows, null, 2));
