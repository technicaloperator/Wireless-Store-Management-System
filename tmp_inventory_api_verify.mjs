import Database from 'better-sqlite3';
import path from 'path';

const API = 'http://localhost:4000/api';
const db = new Database(path.resolve('backend/data/wsms.db'));

function diffObjects(expected, actual) {
  const diffs = [];
  for (const key of Object.keys(expected)) {
    const exp = expected[key];
    const act = actual[key];
    const same = (() => {
      if (Array.isArray(exp)) return JSON.stringify(exp) === JSON.stringify(act || []);
      if (exp === null && act === null) return true;
      return String(exp) === String(act);
    })();
    if (!same) diffs.push({ field: key, expected: exp, actual: act });
  }
  return diffs;
}

(async () => {
  try {
    console.log('GET /api/inventory');
    const allResp = await fetch(`${API}/inventory`);
    const allJson = await allResp.json();
    console.log('status', allResp.status, 'items:', (allJson.data || []).length);

    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const testItem = {
      id: uniqueId,
      item: 'TEST-ITEM',
      company: 'TEST-CO',
      number: '9999',
      numberType: 'GPW',
      status: 'AVAILABLE',
      location: 'WIRELESS STORE',
      faultReason: '',
      repairStatus: '',
      faultyDate: '',
      repairSentDate: '',
      repairedDate: '',
      UNSERVICEABLEDate: '',
      history: [{ action: 'TEST CREATE', date: new Date().toLocaleDateString() }]
    };

    console.log('\nPOST /api/inventory');
    const postResp = await fetch(`${API}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testItem),
    });
    const postJson = await postResp.json();
    console.log('status', postResp.status, 'body.success', postJson.success);
    const created = postJson.data;
    console.log('created id:', created?.id);

    // Verify via DB
    const dbRow = db.prepare('SELECT * FROM inventory WHERE id = ?').get(created.id);
    console.log('\nDB row for created id:', created.id);
    console.log(dbRow);

    // Compare fields
    const expected = { ...testItem };
    // DB stores history as JSON string
    expected.history = testItem.history;

    const actual = { ...dbRow };
    if (actual.history) {
      try { actual.history = JSON.parse(actual.history); } catch (e) { actual.history = actual.history; }
    }

    const diffs = diffObjects(expected, actual);
    console.log('\nField diffs after POST -> DB:');
    if (diffs.length === 0) console.log('No diffs — all fields match'); else console.log(JSON.stringify(diffs, null, 2));

    // GET by id via API
    console.log('\nGET /api/inventory/:id');
    const getResp = await fetch(`${API}/inventory/${created.id}`);
    const getJson = await getResp.json();
    console.log('status', getResp.status, 'success', getJson.success);

    // PUT update
    const updatedPayload = { ...testItem, number: '10000', status: 'FAULTY', location: 'REPAIR', history: [{ action: 'TEST UPDATE', date: new Date().toLocaleDateString() }] };
    console.log('\nPUT /api/inventory/:id');
    const putResp = await fetch(`${API}/inventory/${created.id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(updatedPayload)
    });
    const putJson = await putResp.json();
    console.log('status', putResp.status, 'success', putJson.success);

    const dbRow2 = db.prepare('SELECT * FROM inventory WHERE id = ?').get(created.id);
    if (dbRow2.history) { try { dbRow2.history = JSON.parse(dbRow2.history);} catch(e){} }
    console.log('\nDB row after PUT:');
    console.log(dbRow2);

    const diffs2 = diffObjects(updatedPayload, dbRow2);
    console.log('\nField diffs after PUT -> DB:');
    if (diffs2.length === 0) console.log('No diffs — all fields match'); else console.log(JSON.stringify(diffs2, null, 2));

    // DELETE
    console.log('\nDELETE /api/inventory/:id');
    const delResp = await fetch(`${API}/inventory/${created.id}`, { method: 'DELETE' });
    const delJson = await delResp.json();
    console.log('status', delResp.status, 'success', delJson.success);

    const dbRow3 = db.prepare('SELECT * FROM inventory WHERE id = ?').get(created.id);
    console.log('\nDB row after DELETE (should be undefined):', dbRow3);

    console.log('\nTest complete.');
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
