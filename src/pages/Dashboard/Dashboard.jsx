import "./Dashboard.css";
import { useState, useMemo } from "react";
import { useStore } from "../../Context/StoreContext";
import { items } from "../../data/masterData";

function StockSection({ title, data, status, statusClass, expanded, onToggle, onCardClick }) {
  return (
    <div className={`stock-section ${statusClass}`}>
      <div
        className="collapsible-title"
        onClick={() => onToggle(statusClass)}
      >
        <h1 className="section-title">{title}</h1>

        <span className="collapse-icon">
          {expanded ? "▼" : "▶"}
        </span>
      </div>

      <div className={`dashboard-wrapper ${expanded ? "expanded" : "collapsed"}`}>
        <div className="dashboard-grid">
          {data.map((item, index) => (
            <div
              key={index}
              className={`stock-card ${statusClass}`}
              style={{ cursor: "pointer" }}
              onClick={() => onCardClick(item.name, status)}
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
}

function Dashboard() {
  const { inventory, dashboardFilter, setDashboardFilter } = useStore();
  const [expanded, setExpanded] = useState({
    available: false,
    issued: false,
    faulty: false,
    UNSERVICEABLE: false,
  });

  const stockCounts = useMemo(() => {
    const counts = {};

    items.forEach((item) => {
      counts[item.name] = {
        AVAILABLE: 0,
        ISSUED: 0,
        FAULTY: 0,
        UNSERVICEABLE: 0,
      };
    });

    inventory.forEach((entry) => {
      if (counts[entry.item] && Object.prototype.hasOwnProperty.call(counts[entry.item], entry.status)) {
        counts[entry.item][entry.status] += 1;
      }
    });

    return counts;
  }, [inventory]);

  const availableStock = useMemo(
    () =>
      items.map((item) => ({
        name: item.name,
        qty: stockCounts[item.name]?.AVAILABLE || 0,
      })),
    [stockCounts]
  );

  const issuedStock = useMemo(
    () =>
      items.map((item) => ({
        name: item.name,
        qty: stockCounts[item.name]?.ISSUED || 0,
      })),
    [stockCounts]
  );

  const faultyStock = useMemo(
    () =>
      items.map((item) => ({
        name: item.name,
        qty: stockCounts[item.name]?.FAULTY || 0,
      })),
    [stockCounts]
  );

  const UNSERVICEABLEStock = useMemo(
    () =>
      items.map((item) => ({
        name: item.name,
        qty: stockCounts[item.name]?.UNSERVICEABLE || 0,
      })),
    [stockCounts]
  );

  const handleCardClick = (itemName, status) => {
    setDashboardFilter({
      item: itemName,
      status: status,
      showDetails: true,
    });
  };

  const getItemLocation = (item) => {
  if (dashboardFilter.status === "ISSUED") {

    const latestIssued = [...(item.history || [])]
      .reverse()
      .find((h) => h.action === "ISSUED");

    if (latestIssued) {
      return `${latestIssued.policeStation}, ${latestIssued.district}`;
    }
  }

  return item.location || "WIRELESS STORE";
};

  const filteredDetails = useMemo(
    () =>
      dashboardFilter.showDetails
        ? inventory.filter(
            (entry) =>
              entry.item === dashboardFilter.item &&
              entry.status === dashboardFilter.status
          )
        : [],
    [dashboardFilter.showDetails, dashboardFilter.item, dashboardFilter.status, inventory]
  );

  const currentItem = useMemo(
    () => items.find((x) => x.name === dashboardFilter.item),
    [dashboardFilter.item]
  );

  const handleCloseDetails = () => {
    setDashboardFilter({ ...dashboardFilter, showDetails: false });
  };

  const toggleSection = (statusClass) => {
    setExpanded((prev) => ({
      ...prev,
      [statusClass]: !prev[statusClass],
    }));
  };

  return (
    <div className="dashboard-page">
      <StockSection
        title="Available Stock"
        data={availableStock}
        status="AVAILABLE"
        statusClass="available"
        expanded={expanded.available}
        onToggle={toggleSection}
        onCardClick={handleCardClick}
      />
      <StockSection
        title="Issued Stock"
        data={issuedStock}
        status="ISSUED"
        statusClass="issued"
        expanded={expanded.issued}
        onToggle={toggleSection}
        onCardClick={handleCardClick}
      />
      <StockSection
        title="Faulty Stock"
        data={faultyStock}
        status="FAULTY"
        statusClass="faulty"
        expanded={expanded.faulty}
        onToggle={toggleSection}
        onCardClick={handleCardClick}
      />
      <StockSection
        title="Unserviceable Stock"
        data={UNSERVICEABLEStock}
        status="UNSERVICEABLE"
        statusClass="UNSERVICEABLE"
        expanded={expanded.UNSERVICEABLE}
        onToggle={toggleSection}
        onCardClick={handleCardClick}
      />

      {/* ================= DETAILS MODAL ================= */}
      {dashboardFilter.showDetails && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {dashboardFilter.item} - {dashboardFilter.status}
              </h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseDetails}
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
                onClick={handleCloseDetails}
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