/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";

const STORAGE_KEYS = {
  inventory: "wsms_inventory",
  issues: "wsms_issues",
  faultyStock: "wsms_faultyStock",
  unserviceableStock: "wsms_UNSERVICEABLEStock",
  receives: "wsms_receives",
  activity: "wsms_activity",
  issueVouchers: "wsms_issueVouchers",
  permanentVouchers: "wsms_permanentVouchers",
  users: "wsms_users",
  currentUser: "wsms_currentUser",
};

const defaultUsers = [
  {
    username: "ADMIN",
    password: "wireless123",
    enabled: true,
  },
];
const StoreContext = createContext();

const readStoredValue = (key, fallback) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

const readStoredJson = (key, fallback) => {
  const saved = localStorage.getItem(key);

  if (!saved) return fallback;

  try {
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const writeStoredString = (key, value) => {
  localStorage.setItem(key, value);
};

const API_BASE_URL = "http://localhost:4000/api";

const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Inventory API error");
  }

  return data;
};

const inventoryApi = {
  getAll: async () => {
    const data = await apiFetch(`${API_BASE_URL}/inventory`);
    return data.data || [];
  },
  create: async (item) => {
    const data = await apiFetch(`${API_BASE_URL}/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    return data.data;
  },
  update: async (id, item) => {
    const data = await apiFetch(`${API_BASE_URL}/inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    return data.data;
  },
  delete: async (id) => {
    await apiFetch(`${API_BASE_URL}/inventory/${id}`, {
      method: "DELETE",
    });
    return true;
  },
};

const areInventoryItemsEqual = (a, b) => {
  const keys = [
    "id",
    "item",
    "company",
    "number",
    "numberType",
    "status",
    "location",
    "faultReason",
    "repairStatus",
    "faultyDate",
    "repairSentDate",
    "repairedDate",
    "UNSERVICEABLEDate",
  ];

  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }

  const aHistory = a.history || [];
  const bHistory = b.history || [];

  if (aHistory.length !== bHistory.length) return false;

  for (let i = 0; i < aHistory.length; i += 1) {
    if (JSON.stringify(aHistory[i]) !== JSON.stringify(bHistory[i])) {
      return false;
    }
  }

  return true;
};

export function StoreProvider({ children }) {
  // ---------------- INVENTORY ----------------
  const [inventory, setInventoryState] = useState([]);
  const inventorySyncRef = useRef(false);

  const setInventory = (value) => {
    setInventoryState((prevInventory) => {
      const nextInventory = typeof value === "function" ? value(prevInventory) : value;

      if (!inventorySyncRef.current) {
        syncInventoryChanges(prevInventory, nextInventory);
      }

      return nextInventory;
    });
  };

  const syncInventoryChanges = async (prevInventory, nextInventory) => {
    const prevMap = new Map(prevInventory.map((item) => [item.id, item]));
    const nextMap = new Map(nextInventory.map((item) => [item.id, item]));

    for (const nextItem of nextInventory) {
      const prevItem = prevMap.get(nextItem.id);

      if (!prevItem) {
        inventoryApi.create(nextItem).catch((error) => {
          console.error("Inventory create failed", error);
        });
      } else if (!areInventoryItemsEqual(prevItem, nextItem)) {
        inventoryApi.update(nextItem.id, nextItem).catch((error) => {
          console.error("Inventory update failed", error);
        });
      }
    }

    for (const prevItem of prevInventory) {
      if (!nextMap.has(prevItem.id)) {
        inventoryApi.delete(prevItem.id).catch((error) => {
          console.error("Inventory delete failed", error);
        });
      }
    }
  };

  // ---------------- ISSUES ----------------
  const [issues, setIssues] = useState(() => {
    return readStoredValue(STORAGE_KEYS.issues, []);
  });
// ---------------- FAULTY STOCK ----------------
const [faultyItems, setFaultyItems] = useState(() => {
  return readStoredValue(STORAGE_KEYS.faultyStock, []);
});

// ---------------- UNSERVICEABLE STOCK ----------------
const [UNSERVICEABLEItems, setUNSERVICEABLEItems] = useState(() => {
  return readStoredValue(STORAGE_KEYS.unserviceableStock, []);
});

  // ---------------- RECEIVES ----------------
  const [receives, setReceives] = useState(() => {
    return readStoredValue(STORAGE_KEYS.receives, []);
  });

  // ---------------- ACTIVITY ----------------
  const [activity, setActivity] = useState(() => {
    return readStoredJson(STORAGE_KEYS.activity, []);
  });

  // ---------------- ISSUE VOUCHERS ----------------
  const [issueVouchers, setIssueVouchers] = useState(() => {
    return readStoredValue(STORAGE_KEYS.issueVouchers, []);
  });

  // ---------------- PERMANENT IV VOUCHERS ----------------
  const [permanentVouchers, setPermanentVouchers] = useState(() => {
    return readStoredValue(STORAGE_KEYS.permanentVouchers, []);
  });

  // ---------------- USERS ----------------
const [users, setUsers] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.users);

  if (saved) {
    const parsed = JSON.parse(saved);

    const adminExists = parsed.some(
  (u) => u.username === "ADMIN"
);

    if (!adminExists) {
      parsed.unshift({
        username: "ADMIN",
        password: "wireless123",
        enabled: true,
      });
    }

    return parsed;
  }

  return defaultUsers;
});

// ---------------- CURRENT USER ----------------
const [currentUser, setCurrentUser] = useState(() => {
  return localStorage.getItem(STORAGE_KEYS.currentUser) || "";
});

  // ================= SAVE TO LOCAL STORAGE =================

  // -------- DASHBOARD FILTER --------
  const [dashboardFilter, setDashboardFilter] = useState({
    item: "",
    status: "",
    showDetails: false,
  });

  useEffect(() => {
    const loadInventory = async () => {
      inventorySyncRef.current = true;

      try {
        const items = await inventoryApi.getAll();
        setInventoryState(items);
      } catch (error) {
        console.error("Failed to load inventory", error);
        setInventoryState([]);
      } finally {
        inventorySyncRef.current = false;
      }
    };

    loadInventory();
  }, []);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.issues, issues);
  }, [issues]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.issueVouchers, issueVouchers);
  }, [issueVouchers]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.permanentVouchers, permanentVouchers);
  }, [permanentVouchers]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.receives, receives);
  }, [receives]);

useEffect(() => {
  writeStoredValue(STORAGE_KEYS.faultyStock, faultyItems);
}, [faultyItems]);

useEffect(() => {
  writeStoredValue(STORAGE_KEYS.unserviceableStock, UNSERVICEABLEItems);
}, [UNSERVICEABLEItems]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.activity, activity);
  }, [activity]);

  useEffect(() => {
  writeStoredValue(STORAGE_KEYS.users, users);
}, [users]);

useEffect(() => {
  writeStoredString(STORAGE_KEYS.currentUser, currentUser);
}, [currentUser]);

// ================= ACTIVITY LOGGER =================

const addActivity = ({
  module,
  action,
  details = "",
  user = currentUser || "SYSTEM",
}) => {
  const now = new Date();

  const newActivity = {
    id: Date.now(),

    date: now.toLocaleDateString("en-GB"),

    time: now.toLocaleTimeString("en-GB"),

    user,

    module,

    action,

    details,
  };

  setActivity((prev) => [newActivity, ...prev]);
};

return (
  <StoreContext.Provider
      value={{
  inventory,
  setInventory,

  issues,
  setIssues,

faultyItems,
setFaultyItems,

UNSERVICEABLEItems,
setUNSERVICEABLEItems,

  receives,
  setReceives,

  activity,
  setActivity,
  addActivity,

  issueVouchers,
  setIssueVouchers,

  permanentVouchers,
  setPermanentVouchers,

  users,
  setUsers,

  currentUser,
  setCurrentUser,

  dashboardFilter,
  setDashboardFilter,
}}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}