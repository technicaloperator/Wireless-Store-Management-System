/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

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

export function StoreProvider({ children }) {
  // ---------------- INVENTORY ----------------
  const [inventory, setInventory] = useState(() => {
    return readStoredValue(STORAGE_KEYS.inventory, []);
  });

  useEffect(() => {
    const loadInventoryFromApi = async () => {
      try {
        const response = await fetch("/api/inventory");
        const data = await response.json();

        if (response.ok && data?.success) {
          setInventory(data.data || []);
        }
      } catch {
        // Keep existing localStorage inventory if the API is unavailable.
      }
    };

    loadInventoryFromApi();
  }, []);

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
    writeStoredValue(STORAGE_KEYS.inventory, inventory);
  }, [inventory]);

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