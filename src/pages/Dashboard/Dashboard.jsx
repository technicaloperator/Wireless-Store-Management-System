import "./Dashboard.css";
import { useState } from "react";
import { useStore } from "../../Context/StoreContext";
import { items } from "../../data/masterData";

function Dashboard() {
  const { inventory, dashboardFilter, setDashboardFilter } = useStore();
  const [expanded, setExpanded] = useState({
  available: false,
  issued: false,
  faulty: false,
  CONDEMNED: false,
});
  const getStockData = (status) => {
    return items.map((item) => ({
      name: item.name,
      qty: inventory.filter(
        (entry) => entry.item === item.name && entry.status === status
      ).length,
    }));
  };

  const availableStock = getStockData("AVAILABLE");
  const issuedStock = getStockData("ISSUED");
  const faultyStock = getStockData("FAULTY");
  const CONDEMNEDStock = getStockData("CONDEMNED");

  const handleCardClick = (itemName, status) => {
    setDashboardFilter({
      item: itemName,
      status: status,
      showDetails: true,
    });
  };

  const filteredDetails = dashboardFilter.showDetails
    ? inventory.filter(
        (entry) =>
          entry.item === dashboardFilter.item &&
          entry.status === dashboardFilter.status
      )
    : [];

  const currentItem = items.find((x) => x.name === dashboardFilter.item);

  const getItemLocation = (item) => {
    if (dashboardFilter.status === "ISSUED") {
      // For issued items, get police station and district from history
      const issuedHistory = (item.history || []).find((h) => h.action === "ISSUED");
      if (issuedHistory) {
        return `${issuedHistory.policeStation}, ${issuedHistory.district}`;
      }
    }
    return item.location || "WIRELESS STORE";
  };

  const StockSection = ({ title, data, statusClass }) => {
  const status =
    title.startsWith("Available")
      ? "AVAILABLE"
      : title.startsWith("Issued")
      ? "ISSUED"
      : title.startsWith("Faulty")
      ? "FAULTY"
      : "CONDEMNED";

  return (
    <div className={`stock-section ${statusClass}`}>

      <div
        className="collapsible-title"
        onClick={() =>
          setExpanded((prev) => ({
            ...prev,
            [statusClass]: !prev[statusClass],
          }))
        }
      >
        <h1 className="section-title">{title}</h1>

        <span className="collapse-icon">
          {expanded[statusClass] ? "▼" : "▶"}
        </span>
      </div>

      <div
        className={`dashboard-wrapper ${
          expanded[statusClass] ? "expanded" : "collapsed"
        }`}
      >
        <div className="dashboard-grid">
          {data.map((item, index) => (
            <div
              key={index}
              className={`stock-card ${statusClass}`}
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(item.name, status)}
            >
              <h2>{item.name}</h2>
              <h1>{item.qty}</h1>
              <p>{title.replace(" Stock", "")}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

  return (
    <div className="dashboard-page">
      <StockSection title="Available Store Stock" data={availableStock} statusClass="available" />
      <StockSection title="Issued Stock" data={issuedStock} statusClass="issued" />
      <StockSection title="Faulty Stock" data={faultyStock} statusClass="faulty" />
      <StockSection title="CONDEMNED Stock" data={CONDEMNEDStock} statusClass="CONDEMNED" />

      {/* ================= DETAILS MODAL ================= */}
      {dashboardFilter.showDetails && (
        <div className="modal-overlay" onClick={() => setDashboardFilter({ ...dashboardFilter, showDetails: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {dashboardFilter.item} - {dashboardFilter.status}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setDashboardFilter({ ...dashboardFilter, showDetails: false })}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
  <table className="details-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>{currentItem?.numberType || "NUMBER"}</th>
                  <th>COMPANY</th>
                  <th>STATUS</th>
                  <th>{dashboardFilter.status === "ISSUED" ? "POLICE STATION" : "LOCATION"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      NO RECORDS FOUND
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.number}</td>
                      <td>{row.company}</td>
                      <td>
                        <span className={`status-badge status-${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{getItemLocation(row)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
</div>

            <div className="modal-footer">
              <button
                className="close-detail-btn"
                onClick={() => setDashboardFilter({ ...dashboardFilter, showDetails: false })}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;