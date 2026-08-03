import { insertInventoryItem, fetchInventoryList } from './backend/services/inventoryService.js';
const testItem = {
  id: 999999999999,
  item: 'TEST-ITEM',
  company: 'TESTCO',
  number: '12345',
  numberType: 'GPW',
  status: 'AVAILABLE',
  location: 'WIRELESS STORE',
  faultReason: '',
  repairStatus: '',
  faultyDate: '',
  repairSentDate: '',
  repairedDate: '',
  UNSERVICEABLEDate: '',
  history: [{ action: 'ITEM ADDED', date: '01/01/2026' }],
};
const inserted = insertInventoryItem(testItem);
console.log('INSERTED');
console.log(JSON.stringify(inserted, null, 2));
const fetched = fetchInventoryList().find((x) => x.id === 999999999999);
console.log('FETCHED');
console.log(JSON.stringify(fetched, null, 2));
