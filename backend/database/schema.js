export function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY,
      item TEXT,
      description TEXT,
      quantity INTEGER,
      status TEXT,
      gpwNumber TEXT,
      company TEXT,
      policeStation TEXT,
      mobileVehicle TEXT,
      issueDate TEXT,
      receiveDate TEXT,
      remarks TEXT
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
}
