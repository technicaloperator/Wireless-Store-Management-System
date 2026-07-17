import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../Context/StoreContext";
import { items, commonExtras } from "../../data/masterData";
import "./MobileVehicleData.css";

function MobileVehicleData() {
  const { inventory = [], issueVouchers = [], permanentVouchers = [] } =
    useStore();

  const [highlightedVehicle, setHighlightedVehicle] = useState(null);
// Handle search navigation highlighting
useEffect(() => {
  const highlightVehicle = sessionStorage.getItem("highlight_vehicle");
  const highlightStation = sessionStorage.getItem(
    "highlight_vehicle_station"
  );

  if (highlightStation) {
    setSelectedVehicle(highlightStation);
  }

  if (highlightVehicle) {
    setHighlightedVehicle(highlightVehicle);

    setTimeout(() => {
      setHighlightedVehicle(null);
    }, 2000);
  }

  sessionStorage.removeItem("highlight_vehicle");
  sessionStorage.removeItem("highlight_vehicle_station");
}, []);
  const formatLastUpdated = (value) => {
    if (!value) return "—";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const expandNumbers = (text) => {
    const list = [];

    if (!text) return list;

    text.toString().split(",").forEach((part) => {
      part = part.trim();
      if (!part) return;

      if (part.includes("-")) {
        const [from, to] = part.split("-").map(Number);
        for (let i = from; i <= to; i++) list.push(String(i));
      } else {
        list.push(part);
      }
    });

    return list;
  };

  const [selectedVehicle, setSelectedVehicle] = useState("");
  
  const allVouchers = useMemo(() => {
  return permanentVouchers || [];
}, [permanentVouchers]);

const vehicleList = useMemo(() => {
  const stations = new Set();

  allVouchers.forEach((voucher) => {
    if (
      voucher.policeStation &&
      voucher.mobileVehicle &&
      voucher.mobileVehicle.trim()
    ) {
      stations.add(voucher.policeStation);
    }
  });

  return [...stations].sort();
}, [allVouchers]);

  useEffect(() => {
    if (!vehicleList.length) {
      setSelectedVehicle("");
      return;
    }

    if (!selectedVehicle || !vehicleList.includes(selectedVehicle)) {
      setSelectedVehicle(vehicleList[0]);
    }
  }, [vehicleList, selectedVehicle]);

  const stationItems = useMemo(() => {
    if (!selectedVehicle) return [];

    const rows = [];

    const voucherMap = new Map();
    allVouchers.forEach((v) => voucherMap.set(v.voucherNumber, v));

    const seenIds = new Set();

    // Use inventory history entries and cross-reference vouchers that have mobileVehicle
    inventory.forEach((row) => {
      if (row.status !== "ISSUED") return;

      const issuedHistory = (row.history || []).filter(
        (entry) => entry.action === "ISSUED"
      );
      const latestIssue = issuedHistory[issuedHistory.length - 1];
      if (!latestIssue) return;

      const voucher = voucherMap.get(latestIssue.voucher);
if (!voucher) return;

if (
  voucher.policeStation !== selectedVehicle ||
  !voucher.mobileVehicle?.trim()
) {
  return;
}
      const id = `${row.item}-${row.company}-${row.number}`;
      rows.push({
        id,
        name: row.item,
        company: row.company || "—",
        gpw: row.number,
        ivNo: latestIssue?.voucher || "—",
        mobileVehicle: voucher.mobileVehicle || "—",
        lastUpdated: formatLastUpdated(
          latestIssue.updatedAt || latestIssue.time || latestIssue.date
        ),
      });
      seenIds.add(id);
    });

    // Also include items from vouchers (both temporary and permanent) that have mobileVehicle
    allVouchers.forEach((voucher) => {
  if (
  voucher.policeStation !== selectedVehicle ||
  !voucher.mobileVehicle?.trim()
) {
  return;
}
      (voucher.items || []).forEach((entry, index) => {
        if (entry.received) return;

        const isCommonExtra = commonExtras.includes(entry.item);
        if (!entry.isExtra && !isCommonExtra && !entry.gpwNumbers) return;

        if (entry.isExtra) {
          const vid = `${voucher.voucherNumber}-extra-${index}`;
          if (seenIds.has(vid)) return;

          rows.push({
            id: vid,
            name: entry.item,
            company: entry.company || "—",
            gpw: entry.quantity || 1,
            ivNo: voucher.voucherNumber || "—",
            mobileVehicle: voucher.mobileVehicle || "—",
            lastUpdated: formatLastUpdated(
              entry.updatedAt || voucher.generatedAt || voucher.issueDate
            ),
          });

          seenIds.add(vid);
        } else {
          const numbers = expandNumbers(entry.gpwNumbers || "");
          if (numbers.length === 0) {
            const vid = `${voucher.voucherNumber}-${index}`;
            if (seenIds.has(vid)) return;

            rows.push({
              id: vid,
              name: entry.item,
              company: entry.company || "—",
              gpw: entry.gpwNumbers || "—",
              ivNo: voucher.voucherNumber || "—",
              mobileVehicle: voucher.mobileVehicle || "—",
              lastUpdated: formatLastUpdated(
                entry.updatedAt || voucher.generatedAt || voucher.issueDate
              ),
            });

            seenIds.add(vid);
          } else {
            numbers.forEach((num) => {
              const id = `${entry.item}-${entry.company}-${num}`;
              if (seenIds.has(id)) return;

              rows.push({
                id,
                name: entry.item,
                company: entry.company || "—",
                gpw: num,
                ivNo: voucher.voucherNumber || "—",
                mobileVehicle: voucher.mobileVehicle || "—",
                lastUpdated: formatLastUpdated(
                  entry.updatedAt || voucher.generatedAt || voucher.issueDate
                ),
              });

              seenIds.add(id);
            });
          }
        }
      });
    });

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedVehicle, inventory, allVouchers]);

  return (
    <div className="mobile-vehicle-data-page">
      <div className="mobile-vehicle-data-header">
        <h2>Mobile Vehicle Data</h2>
        <p>Active items issued to mobile vehicles grouped by police station.</p>
      </div>

      {vehicleList.length === 0 ? (
        <div className="empty-card">No mobile-vehicle issues found yet.</div>
      ) : (
        <div className="station-data-layout">
          <div className="station-list-panel">
            <h3>Police Stations</h3>
            <div className="station-list">
              {vehicleList.map((station) => (
                <button
                  key={station}
                  className={`station-chip ${
                    station === selectedVehicle ? "active" : ""
                  }`}
                  onClick={() => setSelectedVehicle(station)}
                >
                  {station}
                </button>
              ))}
            </div>
          </div>

          <div className="station-details-panel">
            <h3>{selectedVehicle}</h3>

            {stationItems.length === 0 ? (
              <div className="empty-card">
                No mobile-vehicle issued items found for this station.
              </div>
            ) : (
              <div className="vehicle-groups">
                {(() => {
                  const groups = stationItems.reduce((acc, row) => {
                    const mv = row.mobileVehicle || "—";
                    if (!acc[mv]) acc[mv] = [];
                    acc[mv].push(row);
                    return acc;
                  }, {});

                  return Object.keys(groups).map((mv) => (
                    <div key={mv} className={`vehicle-group ${highlightedVehicle === mv ? "highlight-vehicle" : ""}`}>
                      <h4 className="vehicle-title">{mv}</h4>
                      <table className="station-items-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Company</th>
                            <th>Gpw/SR.No./QTY</th>
                            <th>IV No.</th>
                            <th>Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groups[mv].map((item) => (
                            <tr key={item.id}>
                              <td>{item.name}</td>
                              <td>{item.company}</td>
                              <td>{item.gpw}</td>
                              <td>{item.ivNo}</td>
                              <td>{item.lastUpdated}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileVehicleData;
