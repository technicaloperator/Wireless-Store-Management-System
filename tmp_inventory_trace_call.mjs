import { createInventoryItem } from './backend/controllers/inventoryController.js';
import fs from 'fs';

// Remove existing trace log
try { fs.unlinkSync('backend/tmp_trace.log'); } catch (e) {}

const uniqueId = 2000000000000;
const testItem = {
  id: uniqueId,
  item: 'TRACE-TEST-ITEM',
  company: 'TRACE-CO',
  number: '5555',
  numberType: 'GPW',
  status: 'AVAILABLE',
  location: 'WIRELESS STORE',
  faultReason: '',
  repairStatus: '',
  faultyDate: '',
  repairSentDate: '',
  repairedDate: '',
  UNSERVICEABLEDate: '',
  history: [{ action: 'TRACE CREATE', date: new Date().toLocaleDateString() }]
};

const req = { body: testItem };
let resBody = null;
const res = {
  status(code) { this._code = code; return this; },
  json(obj) { resBody = { code: this._code, obj }; }
};

(async () => {
  await createInventoryItem(req, res);
  // read trace log
  try {
    const content = fs.readFileSync('backend/tmp_trace.log', 'utf8');
    console.log('TRACE LOG CONTENT:\n', content);
  } catch (e) {
    console.error('No trace log found', e.message);
  }
  // show DB row
  const Database = (await import('better-sqlite3')).default;
  const path = (await import('path')).default;
  const db = new Database(path.resolve('backend/data/wsms.db'));
  const row = db.prepare('SELECT * FROM inventory WHERE id = ?').get(uniqueId);
  console.log('DB ROW:', row);
  // cleanup: delete inserted test row
  db.prepare('DELETE FROM inventory WHERE id = ?').run(uniqueId);
})();
