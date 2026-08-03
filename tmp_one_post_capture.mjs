import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const API = 'http://localhost:4000/api';

// remove existing trace file
try { fs.unlinkSync('backend/tmp_trace.log'); } catch (e) {}

const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
const payload = {
  id: uniqueId,
  item: 'ONE-POST-TRACE',
  company: 'TRACE-CO',
  number: '8888',
  numberType: 'GPW',
  status: 'AVAILABLE',
  location: 'WIRELESS STORE',
  faultReason: '',
  repairStatus: '',
  faultyDate: '',
  repairSentDate: '',
  repairedDate: '',
  UNSERVICEABLEDate: '',
  history: [{ action: 'ONE POST TRACE', date: new Date().toLocaleDateString() }]
};

(async () => {
  try {
    const resp = await fetch(`${API}/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const postJson = await resp.json();
    console.log('POST status', resp.status, 'created id', postJson?.data?.id);

    // wait briefly for logs to flush
    await new Promise(r => setTimeout(r, 200));

    let trace = null;
    try { trace = fs.readFileSync('backend/tmp_trace.log', 'utf8'); } catch (e) { trace = null; }
    console.log('\n--- TRACE FILE CONTENT ---');
    console.log(trace || '(no trace file)');

    const dbPath = path.resolve('backend/data/wsms.db');
    const db = new Database(dbPath);
    const row = db.prepare('SELECT * FROM inventory WHERE id = ?').get(postJson?.data?.id || uniqueId);
    console.log('\n--- DB ROW ---');
    console.log(row);

    console.log('\n--- API GET /inventory/:id ---');
    const getResp = await fetch(`${API}/inventory/${postJson?.data?.id || uniqueId}`);
    const getJson = await getResp.json();
    console.log('GET status', getResp.status, 'success', getJson.success);
    console.log(JSON.stringify(getJson.data, null, 2));

    // cleanup inserted row
    try { db.prepare('DELETE FROM inventory WHERE id = ?').run(postJson?.data?.id || uniqueId); } catch (e) {}
    db.close();

  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
