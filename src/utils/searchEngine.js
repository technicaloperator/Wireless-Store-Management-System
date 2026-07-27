/**
 * Global Smart Search Engine for WSMS
 * Handles searching across all modules with intelligent result grouping
 */

// Normalize search term for partial matching
const normalizeText = (text) => {
  if (!text) return "";
  return String(text).toUpperCase().trim();
};

// Check if searchTerm partially matches text
const partialMatch = (text, searchTerm) => {
  if (!text || !searchTerm) return false;
  return normalizeText(text).includes(normalizeText(searchTerm));
};

// Expand number ranges (e.g., "1-5,7" -> ["1", "2", "3", "4", "5", "7"])
const expandNumbers = (text) => {
  if (!text) return [];
  const list = [];
  String(text)
    .split(",")
    .forEach((part) => {
      part = part.trim();
      if (!part) return;
      if (part.includes("-")) {
        const [from, to] = part.split("-").map(Number);
        for (let i = from; i <= to; i++) {
          list.push(String(i));
        }
      } else {
        list.push(part);
      }
    });
  return list;
};

// Check if any number matches in a range string
const matchesNumberRange = (rangeStr, searchTerm) => {
  const numbers = expandNumbers(rangeStr);
  return numbers.some((num) => partialMatch(num, searchTerm));
};

/**
 * Search Inventory Items
 */
const searchInventory = (inventory, searchTerm) => {
  const results = [];
  const seen = new Set();

  inventory.forEach((item) => {
    let matches = false;
    let matchType = null;

    // Check all searchable fields
    if (partialMatch(item.number, searchTerm)) {
      matches = true;
      matchType = "GPW/SERIAL";
    } else if (partialMatch(item.item, searchTerm)) {
      matches = true;
      matchType = "ITEM";
    } else if (partialMatch(item.company, searchTerm)) {
      matches = true;
      matchType = "COMPANY";
    } else if (partialMatch(item.status, searchTerm)) {
      matches = true;
      matchType = "STATUS";
    } else if (item.location && partialMatch(item.location, searchTerm)) {
      matches = true;
      matchType = "LOCATION";
    }

    if (matches) {
      const id = `inv-${item.id}`;
      if (!seen.has(id)) {
        seen.add(id);
        results.push({
          module: "INVENTORY",
          type: "INVENTORY_ITEM",
          id,
          data: item,
          matchType,
          display: {
            title: `${item.item} - ${item.company}`,
            subtitle: `GPW: ${item.number}`,
            meta: [
              `Status: ${item.status}`,
              item.location && `Location: ${item.location}`,
            ].filter(Boolean),
          },
        });
      }
    }
  });

  return results;
};
/**
 * Search Faulty & UNSERVICEABLE Stock
 */
const searchFaultyStock = (
  faultyItems,
  UNSERVICEABLEItems,
  searchTerm
) => {
  const results = [];

  // ---------- FAULTY ----------
  faultyItems.forEach((item) => {
    let matchType = null;

    if (partialMatch(item.gpw, searchTerm))
      matchType = "GPW/SERIAL";
    else if (partialMatch(item.item, searchTerm))
      matchType = "ITEM";
    else if (partialMatch(item.company, searchTerm))
      matchType = "COMPANY";
    else if (partialMatch(item.reason, searchTerm))
      matchType = "REASON";

    if (matchType) {
      results.push({
        module: "FAULTY STOCK",
        type: "FAULTY_ITEM",
        id: `faulty-${item.id}`,
        data: item,
        matchType,
        display: {
          title: `${item.item} - ${item.company}`,
          subtitle: `GPW: ${item.gpw}`,
          meta: [
            `Status: ${item.repairStage}`,
            `Reason: ${item.reason}`,
          ],
        },
      });
    }
  });

  // ---------- UNSERVICEABLE ----------
  UNSERVICEABLEItems.forEach((item) => {
    let matchType = null;

    if (partialMatch(item.gpw, searchTerm))
      matchType = "GPW/SERIAL";
    else if (partialMatch(item.item, searchTerm))
      matchType = "ITEM";
    else if (partialMatch(item.company, searchTerm))
      matchType = "COMPANY";
    else if (partialMatch(item.reason, searchTerm))
      matchType = "REASON";

    if (matchType) {
      results.push({
        module: "FAULTY STOCK",
        type: "UNSERVICEABLE_ITEM",
        id: `cond-${item.id}`,
        data: item,
        matchType,
        display: {
          title: `${item.item} - ${item.company}`,
          subtitle: `GPW: ${item.gpw}`,
          meta: [
            "UNSERVICEABLE",
            `Reason: ${item.reason}`,
          ],
        },
      });
    }
  });

  return results;
};
/**
 * Search Issue Vouchers (Temporary & Permanent)
 */
const searchVouchers = (vouchers, voucherType, searchTerm, inventory) => {
  const results = [];
  const seen = new Set();

  vouchers.forEach((voucher) => {
    let matches = false;
    let matchType = null;

    // Search voucher number
    if (partialMatch(voucher.voucherNumber, searchTerm)) {
      matches = true;
      matchType = "IV_NUMBER";
    }
    // Search issue date
    else if (partialMatch(voucher.issueDate, searchTerm)) {
      matches = true;
      matchType = "DATE";
    }
    // Search police station
    else if (partialMatch(voucher.policeStation, searchTerm)) {
      matches = true;
      matchType = "POLICE_STATION";
    }
    // Search mobile vehicle
    else if (
      voucher.mobileVehicle &&
      partialMatch(voucher.mobileVehicle, searchTerm)
    ) {
      matches = true;
      matchType = "VEHICLE";
    }
    // Search officer designation
    else if (partialMatch(voucher.designation, searchTerm)) {
      matches = true;
      matchType = "DESIGNATION";
    }
    // Search officer name
    else if (partialMatch(voucher.officerName, searchTerm)) {
      matches = true;
      matchType = "OFFICER";
    }
    // Search items in voucher
    else if (voucher.items) {
      for (const item of voucher.items) {
        if (partialMatch(item.item, searchTerm)) {
          matches = true;
          matchType = "ITEM";
          break;
        }
        if (partialMatch(item.company, searchTerm)) {
          matches = true;
          matchType = "COMPANY";
          break;
        }
        if (
          item.gpwNumbers &&
          matchesNumberRange(item.gpwNumbers, searchTerm)
        ) {
          matches = true;
          matchType = "GPW/SERIAL";
          break;
        }
      }
    }

    if (matches) {
      const id = `${voucherType}-${voucher.voucherNumber}`;
      if (!seen.has(id)) {
        seen.add(id);
        const itemCount = (voucher.items || []).reduce((sum, item) => {
          if (item.isExtra) return sum + (item.quantity || 1);
          return sum + expandNumbers(item.gpwNumbers).length;
        }, 0);

        results.push({
          module: voucherType === "TEMP_IV" ? "TEMPORARY IV" : "PERMANENT IV",
          type: "VOUCHER",
          id,
          data: voucher,
          voucherType,
          matchType,
          display: {
            title: `${voucher.voucherNumber}`,
            subtitle: `${
              voucher.policeStation || "—"
            } | Items: ${itemCount}`,
            meta: [
              `Date: ${voucher.issueDate || "—"}`,
              voucher.mobileVehicle &&
                `Vehicle: ${voucher.mobileVehicle}`,
              `Officer: ${voucher.designation || "—"}`,
            ].filter(Boolean),
          },
        });
      }
    }
  });

  return results;
};

/**
 * Search Police Station Data
 */
const searchPoliceStationData = (
  inventory,
  permanentVouchers,
  searchTerm
) => {
  const results = [];
  const stationSet = new Set();

  // Collect police stations
  permanentVouchers.forEach((voucher) => {
    if (voucher.policeStation) {
      stationSet.add(voucher.policeStation);
    }
  });

  // Search stations
  for (const station of stationSet) {
    if (partialMatch(station, searchTerm)) {
      const stationVouchers = permanentVouchers.filter(
        (v) => v.policeStation === station
      );
      const stationItems = inventory.filter((item) => {
        const issuedHistory = (item.history || []).filter(
          (entry) =>
            entry.action === "ISSUED" && entry.policeStation === station
        );
        return issuedHistory.length > 0 && item.status === "ISSUED";
      });

      results.push({
        module: "POLICE STATION DATA",
        type: "POLICE_STATION",
        id: `ps-${station}`,
        data: {
          policeStation: station,
          voucherCount: stationVouchers.length,
          itemCount: stationItems.length,
        },
        matchType: "POLICE_STATION",
        display: {
          title: station,
          subtitle: `${stationVouchers.length} Voucher(s) | ${stationItems.length} Item(s)`,
          meta: [],
        },
      });
    }
  }

  return results;
};

/**
 * Search Mobile Vehicle Data
 */
const searchMobileVehicleData = (
  inventory,
  issueVouchers,
  permanentVouchers,
  searchTerm
) => {
  const results = [];
  const allVouchers = [...issueVouchers, ...permanentVouchers];
  const vehicleSet = new Set();
  const vehicleToStationMap = {};

  // Collect vehicles and their associated stations
  allVouchers.forEach((voucher) => {
    if (voucher.mobileVehicle && voucher.policeStation) {
      vehicleSet.add(voucher.mobileVehicle);
      vehicleToStationMap[voucher.mobileVehicle] = voucher.policeStation;
    }
  });

  // Search vehicles
  for (const vehicle of vehicleSet) {
    if (partialMatch(vehicle, searchTerm)) {
      const vehicleVouchers = allVouchers.filter(
        (v) => v.mobileVehicle === vehicle
      );
      const vehicleItems = inventory.filter((item) => {
        const issuedHistory = (item.history || []).filter((entry) => {
          const voucher = allVouchers.find(
            (v) => v.voucherNumber === entry.voucher
          );
          return (
            entry.action === "ISSUED" &&
            voucher &&
            voucher.mobileVehicle === vehicle
          );
        });
        return issuedHistory.length > 0 && item.status === "ISSUED";
      });
      
      const station = vehicleToStationMap[vehicle] || "";

      results.push({
        module: "MOBILE VEHICLE DATA",
        type: "VEHICLE",
        id: `vehicle-${vehicle}`,
        data: {
          mobileVehicle: vehicle,
          policeStation: station,
          voucherCount: vehicleVouchers.length,
          itemCount: vehicleItems.length,
        },
        matchType: "VEHICLE",
        display: {
          title: vehicle,
          subtitle: `${vehicleVouchers.length} Voucher(s) | ${vehicleItems.length} Item(s)`,
          meta: [station && `Station: ${station}`].filter(Boolean),
        },
      });
    }
  }

  return results;
};

/**
 * Search Users
 */
const searchUsers = (users, searchTerm) => {
  const results = [];

  users.forEach((user, idx) => {
    if (partialMatch(user.username, searchTerm)) {
      results.push({
        module: "USER MANAGEMENT",
        type: "USER",
        id: `user-${idx}`,
        data: user,
        matchType: "USERNAME",
        display: {
          title: user.username,
          subtitle: user.enabled ? "Active" : "Inactive",
          meta: [],
        },
      });
    }
  });

  return results;
};

/**
 * Main Search Function
 * Searches across all modules and returns grouped results
 */
export const performGlobalSearch = (searchTerm, storeData) => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const {
  inventory = [],
  issueVouchers = [],
  permanentVouchers = [],
  receives = [],
  users = [],

  faultyItems = [],
  UNSERVICEABLEItems = [],
} = storeData;


  const allResults = [];

  // Search inventory
  allResults.push(...searchInventory(inventory, searchTerm));

  // Search Faulty Stock
allResults.push(
  ...searchFaultyStock(
    faultyItems,
    UNSERVICEABLEItems,
    searchTerm
  )
);

  // Search issue vouchers
  allResults.push(
    ...searchVouchers(issueVouchers, "TEMP_IV", searchTerm, inventory)
  );

  // Search permanent vouchers
  allResults.push(
    ...searchVouchers(permanentVouchers, "PERM_IV", searchTerm, inventory)
  );

  // Search police station data
  allResults.push(
    ...searchPoliceStationData(inventory, permanentVouchers, searchTerm)
  );

  // Search mobile vehicle data
  allResults.push(
    ...searchMobileVehicleData(
      inventory,
      issueVouchers,
      permanentVouchers,
      searchTerm
    )
  );

  // Search users
  allResults.push(...searchUsers(users, searchTerm));

  // Group by module and preserve order
  const grouped = {};
  allResults.forEach((result) => {
    if (!grouped[result.module]) {
      grouped[result.module] = [];
    }
    grouped[result.module].push(result);
  });

  // Convert to array and maintain order
  const moduleOrder = [
  "INVENTORY",
  "FAULTY STOCK",
  "TEMPORARY IV",
  "PERMANENT IV",
  "POLICE STATION DATA",
  "MOBILE VEHICLE DATA",
  "USER MANAGEMENT",
];

  const orderedResults = [];
  moduleOrder.forEach((module) => {
    if (grouped[module]) {
      orderedResults.push(...grouped[module]);
    }
  });

  return orderedResults;
};

export default {
  performGlobalSearch,
  normalizeText,
  partialMatch,
  expandNumbers,
};
