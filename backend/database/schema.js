function addColumnIfMissing(db, table, column, columnType) {
  const row = db
    .prepare(`PRAGMA table_info(${table});`)
    .all()
    .find((col) => col.name === column);

  if (!row) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${columnType};`).run();
  }
}

export function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY,
      item TEXT,
      company TEXT,
      number TEXT,
      numberType TEXT,
      status TEXT,
      location TEXT,
      faultReason TEXT,
      repairStatus TEXT,
      faultyDate TEXT,
      repairSentDate TEXT,
      repairedDate TEXT,
      UNSERVICEABLEDate TEXT,
      history TEXT
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY,
      issueId TEXT,
      itemId INTEGER,
      voucherNumber TEXT,
      issueDate TEXT,
      issuedTo TEXT,
      status TEXT,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS receives (
      id INTEGER PRIMARY KEY,
      receiveId TEXT,
      itemId INTEGER,
      voucherNumber TEXT,
      receiveDate TEXT,
      receivedFrom TEXT,
      status TEXT,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY,
      date TEXT,
      time TEXT,
      user TEXT,
      module TEXT,
      action TEXT,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS issueVouchers (
      id INTEGER PRIMARY KEY,
      voucherNumber TEXT,
      voucherDate TEXT,
      issuedBy TEXT,
      receivedBy TEXT,
      details TEXT,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS permanentVouchers (
      id INTEGER PRIMARY KEY,
      voucherNumber TEXT,
      voucherDate TEXT,
      issuedBy TEXT,
      receivedBy TEXT,
      details TEXT,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      enabled INTEGER
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      key TEXT UNIQUE,
      value TEXT
    );
  `);

  addColumnIfMissing(db, "inventory", "company", "TEXT");
  addColumnIfMissing(db, "inventory", "number", "TEXT");
  addColumnIfMissing(db, "inventory", "numberType", "TEXT");
  addColumnIfMissing(db, "inventory", "status", "TEXT");
  addColumnIfMissing(db, "inventory", "location", "TEXT");
  addColumnIfMissing(db, "inventory", "faultReason", "TEXT");
  addColumnIfMissing(db, "inventory", "repairStatus", "TEXT");
  addColumnIfMissing(db, "inventory", "faultyDate", "TEXT");
  addColumnIfMissing(db, "inventory", "repairSentDate", "TEXT");
  addColumnIfMissing(db, "inventory", "repairedDate", "TEXT");
  addColumnIfMissing(db, "inventory", "UNSERVICEABLEDate", "TEXT");
  addColumnIfMissing(db, "inventory", "history", "TEXT");
}
