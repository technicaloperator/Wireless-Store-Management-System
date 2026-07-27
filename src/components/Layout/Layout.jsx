import "./Layout.css";

import { useStore } from "../../Context/StoreContext";

function Layout({
  children,
  currentPage,
  setCurrentPage,
  operator,
  onSearch,
}) 
{
  const { currentUser, activity, setActivity } = useStore();
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

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>WSMS</h2>

        {menuGroups.map((group, groupIndex) => (
  <div key={groupIndex} className="menu-group">

    {group.map((item) => (
      <div
        key={item.id}
        className={`menu-item ${
          currentPage === item.id ? "active" : ""
        }`}
        onClick={() => setCurrentPage(item.id)}
      >
        {item.label}
      </div>
    ))}

  </div>
))}
      </div>

      <div className="main">
        <div className="header">

  <div>
    <h2>Wireless Department Morbi</h2>
    <p>Wireless Store Management System</p>
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "15px",
    }}
  >

    <button
      className="search-button"
      onClick={() => onSearch && onSearch()}
      title="Search (Ctrl+F)"
    >
      <span style={{ fontSize: "16px" }}>🔍</span>
      <span>Search</span>
    </button>

    <div
      style={{
        fontWeight: "600",
        color: "#183153",
      }}
    >
      👤 {operator}
    </div>

    <button
      className="logout-btn"
      onClick={() => {

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
}}
    >
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