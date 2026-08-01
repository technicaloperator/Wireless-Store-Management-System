import "./Layout.css";

import { useStore } from "../../Context/StoreContext";

const menuGroups = [
  [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "inventory", label: "🗃️ Inventory" },
  ],

  [
    { id: "issue", label: "📤 Issue" },
    { id: "receive", label: "📥 Receive" },
    { id: "faulty-stock", label: "🛠️ Faulty Stock" },
  ],

  [
    { id: "police-station-data", label: "🏛️ Police Station Data" },
    { id: "mobile-vehicle-data", label: "🚔 Mobile Vehicle Data" },
  ],

  [
    { id: "temporary", label: "📝 Temporary IV" },
    { id: "permanent", label: "📑 Permanent IV" },
  ],

  [
    { id: "activity", label: "📋 Activity Log" },
  ],

  [
    { id: "users", label: "👥 User Management" },
    { id: "settings", label: "⚙️ Settings" },
  ],
];

function MenuItem({ item, currentPage, setCurrentPage }) {
  const isActive = currentPage === item.id;

  return (
    <div
      className={`menu-item ${isActive ? "active" : ""}`}
      onClick={() => setCurrentPage(item.id)}
    >
      <span className="menu-text">{item.label}</span>
      {isActive && <span className="menu-arrow">➡</span>}
    </div>
  );
}

function MenuGroup({ group, currentPage, setCurrentPage }) {
  return (
    <div className="menu-group">
      {group.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      ))}
    </div>
  );
}

function Layout({ children, currentPage, setCurrentPage, operator, onSearch }) {
  const { currentUser, activity, setActivity } = useStore();

  const handleLogout = () => {
    setActivity([
      {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        operator: currentUser,
        activity: "LOGOUT",
      },
      ...activity,
    ]);

    localStorage.removeItem("wsms_operator");
    localStorage.removeItem("wsms_currentUser");

    window.location.reload();
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>WSMS</h2>

        {menuGroups.map((group, index) => (
          <MenuGroup
            key={index}
            group={group}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        ))}
      </div>

      <div className="main">
        <div className="header">
          <div>
            <h2>Wireless Department Morbi</h2>
            <p>Wireless Store Management System</p>
          </div>

          <div className="header-actions">
            <button
              className="search-button"
              onClick={() => onSearch && onSearch()}
              title="Search (Ctrl+F)"
            >
              <span className="search-icon">🔍</span>
              <span>Search</span>
            </button>

            <div className="operator-name">👤 {operator}</div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default Layout;