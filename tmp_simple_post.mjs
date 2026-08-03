// use global fetch available in Node 18+
import fs from 'fs';

const API = 'http://localhost:4000/api';
try { fs.unlinkSync('backend/tmp_trace.log'); } catch (e) {}

const testItem = { id: 3000000000000, item: 'SIMPLE-POST', company: 'S-CO', number: '7777', numberType: 'GPW', status: 'AVAILABLE', location: 'WAREHOUSE', history: [{ action: 'SIMPLE', date: new Date().toLocaleDateString() }] };
(async () => {
  const resp = await fetch(`${API}/inventory`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(testItem) });
  const json = await resp.json();
  console.log('POST status', resp.status, 'resp.success', json.success, 'created id', json.data?.id);
  // wait briefly
  await new Promise(r => setTimeout(r, 200));
  try { const content = fs.readFileSync('backend/tmp_trace.log', 'utf8'); console.log('\nTRACE FILE:\n', content); } catch (e) { console.error('no trace file', e.message); }
  // cleanup
  try { const Database = (await import('better-sqlite3')).default; const path = (await import('path')).default; const db = new Database(path.resolve('backend/data/wsms.db')); db.prepare('DELETE FROM inventory WHERE id = ?').run(testItem.id); } catch (e) {}
})();
