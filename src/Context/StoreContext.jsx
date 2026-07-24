import { createContext, useContext, useEffect, useState } from "react";

const defaultUsers = [
  {
    username: "ADMIN",
    password: "wireless123",
    enabled: true,
  },
];
const StoreContext = createContext();

export function StoreProvider({ children }) {
  // ---------------- INVENTORY ----------------
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("wsms_inventory");
    return saved ? JSON.parse(saved) : [];
  });

  // ---------------- ISSUES ----------------
  const [issues, setIssues] = useState(() => {
    const saved = localStorage.getItem("wsms_issues");
    return saved ? JSON.parse(saved) : [];
  });
// ---------------- FAULTY STOCK ----------------
const [faultyItems, setFaultyItems] = useState(() => {
  const saved = localStorage.getItem("wsms_faultyStock");
  return saved ? JSON.parse(saved) : [];
});

// ---------------- CONDEMNED STOCK ----------------
const [CONDEMNEDItems, setCONDEMNEDItems] = useState(() => {
  const saved = localStorage.getItem("wsms_CONDEMNEDStock");
  return saved ? JSON.parse(saved) : [];
});

  // ---------------- RECEIVES ----------------
  const [receives, setReceives] = useState(() => {
    const saved = localStorage.getItem("wsms_receives");
    return saved ? JSON.parse(saved) : [];
  });

  // ---------------- ACTIVITY ----------------
  const getTodayDateString = () => new Date().toLocaleDateString();

  const [activity, setActivity] = useState(() => {
    const saved = localStorage.getItem("wsms_activity");
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      const today = getTodayDateString();
      return Array.isArray(parsed)
        ? parsed.filter((entry) => entry.date === today)
        : [];
    } catch (error) {
      return [];
    }
  });

  // ---------------- ISSUE VOUCHERS ----------------
  const [issueVouchers, setIssueVouchers] = useState(() => {
    const saved = localStorage.getItem("wsms_issueVouchers");
    return saved ? JSON.parse(saved) : [];
  });

  // ---------------- PERMANENT IV VOUCHERS ----------------
  const [permanentVouchers, setPermanentVouchers] = useState(() => {
    const saved = localStorage.getItem("wsms_permanentVouchers");
    return saved ? JSON.parse(saved) : [];
  });

  // ---------------- USERS ----------------
const [users, setUsers] = useState(() => {
  const saved = localStorage.getItem("wsms_users");

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
  return localStorage.getItem("wsms_currentUser") || "";
});

  // ================= SAVE TO LOCAL STORAGE =================

  // -------- DASHBOARD FILTER --------
  const [dashboardFilter, setDashboardFilter] = useState({
    item: "",
    status: "",
    showDetails: false,
  });

  useEffect(() => {
    localStorage.setItem("wsms_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("wsms_issues", JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem("wsms_issueVouchers", JSON.stringify(issueVouchers));
  }, [issueVouchers]);

  useEffect(() => {
    localStorage.setItem("wsms_permanentVouchers", JSON.stringify(permanentVouchers));
  }, [permanentVouchers]);

  useEffect(() => {
    localStorage.setItem("wsms_receives", JSON.stringify(receives));
  }, [receives]);

useEffect(() => {
  localStorage.setItem(
    "wsms_faultyStock",
    JSON.stringify(faultyItems)
  );
}, [faultyItems]);

useEffect(() => {
  localStorage.setItem(
    "wsms_CONDEMNEDStock",
    JSON.stringify(CONDEMNEDItems)
  );
}, [CONDEMNEDItems]);

  useEffect(() => {
    localStorage.setItem("wsms_activity", JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
  localStorage.setItem(
    "wsms_users",
    JSON.stringify(users)
  );
}, [users]);

useEffect(() => {
  localStorage.setItem(
    "wsms_currentUser",
    currentUser
  );
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

CONDEMNEDItems,
setCONDEMNEDItems,

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