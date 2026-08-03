import db from "../database/db.js";

const formatInventoryRow = (row) => {
  if (!row) return null;
  const history = row.history ? JSON.parse(row.history) : [];

  return {
    ...row,
    history,
  };
};

export function fetchInventoryList() {
  return db.prepare("SELECT * FROM inventory").all().map(formatInventoryRow);
}

export function fetchInventoryItemById(id) {
  return formatInventoryRow(
    db.prepare("SELECT * FROM inventory WHERE id = ?").get(id)
  );
}

export function insertInventoryItem(payload) {
  const historyJson = payload.history ? JSON.stringify(payload.history) : JSON.stringify([]);

  if (payload.id) {
    db.prepare(
      `INSERT INTO inventory (
        id,
        item,
        company,
        number,
        numberType,
        status,
        location,
        faultReason,
        repairStatus,
        faultyDate,
        repairSentDate,
        repairedDate,
        UNSERVICEABLEDate,
        history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      payload.id,
      payload.item || null,
      payload.company || null,
      payload.number || null,
      payload.numberType || null,
      payload.status || null,
      payload.location || null,
      payload.faultReason || null,
      payload.repairStatus || null,
      payload.faultyDate || null,
      payload.repairSentDate || null,
      payload.repairedDate || null,
      payload.UNSERVICEABLEDate || null,
      historyJson
    );

    return fetchInventoryItemById(payload.id);
  }

  const result = db.prepare(
    `INSERT INTO inventory (
      item,
      company,
      number,
      numberType,
      status,
      location,
      faultReason,
      repairStatus,
      faultyDate,
      repairSentDate,
      repairedDate,
      UNSERVICEABLEDate,
      history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    payload.item || null,
    payload.company || null,
    payload.number || null,
    payload.numberType || null,
    payload.status || null,
    payload.location || null,
    payload.faultReason || null,
    payload.repairStatus || null,
    payload.faultyDate || null,
    payload.repairSentDate || null,
    payload.repairedDate || null,
    payload.UNSERVICEABLEDate || null,
    historyJson
  );

  return fetchInventoryItemById(result.lastInsertRowid);
}

export function modifyInventoryItem(id, payload) {
  const existing = fetchInventoryItemById(id);

  if (!existing) return null;

  db.prepare(
    `UPDATE inventory SET
      item = ?,
      company = ?,
      number = ?,
      numberType = ?,
      status = ?,
      location = ?,
      faultReason = ?,
      repairStatus = ?,
      faultyDate = ?,
      repairSentDate = ?,
      repairedDate = ?,
      UNSERVICEABLEDate = ?,
      history = ?
    WHERE id = ?`
  ).run(
    payload.item || existing.item,
    payload.company || existing.company,
    payload.number || existing.number,
    payload.numberType || existing.numberType,
    payload.status || existing.status,
    payload.location || existing.location,
    payload.faultReason || existing.faultReason,
    payload.repairStatus || existing.repairStatus,
    payload.faultyDate || existing.faultyDate,
    payload.repairSentDate || existing.repairSentDate,
    payload.repairedDate || existing.repairedDate,
    payload.UNSERVICEABLEDate || existing.UNSERVICEABLEDate,
    payload.history ? JSON.stringify(payload.history) : JSON.stringify(existing.history || []),
    id
  );

  return fetchInventoryItemById(id);
}

export function removeInventoryItem(id) {
  const result = db.prepare("DELETE FROM inventory WHERE id = ?").run(id);
  return result.changes > 0;
}
