import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../Context/StoreContext";
import { items, commonExtras } from "../../data/masterData";
import "./PoliceStationData.css";

function PoliceStationData() {
  const {
    inventory = [],
    issueVouchers = [],
    permanentVouchers = [],
  } = useStore();

  const [highlightedStation, setHighlightedStation] = useState(null);

  // Handle search navigation highlighting
  useEffect(() => {
    const highlightStation = sessionStorage.getItem("highlight_station");
    if (highlightStation) {
      setSelectedStation(highlightStation);
      setHighlightedStation(highlightStation);
      // Remove highlight after 2 seconds
      setTimeout(() => setHighlightedStation(null), 2000);
      sessionStorage.removeItem("highlight_station");
    }
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

  const [selectedStation, setSelectedStation] = useState("");

  const stationList = useMemo(() => {
    const stations = new Set();

    // Only consider Permanent IV vouchers for police-station data
    permanentVouchers.forEach((voucher) => {
      if (voucher.policeStation) stations.add(voucher.policeStation);
    });

    return [...stations];
  }, [permanentVouchers]);

  useEffect(() => {
    if (!stationList.length) {
      setSelectedStation("");
      return;
    }

    if (!selectedStation || !stationList.includes(selectedStation)) {
      setSelectedStation(stationList[0]);
    }
  }, [stationList, selectedStation]);

  const stationItems = useMemo(() => {
    if (!selectedStation) return [];

    const rows = [];

    // Build a set of permanent voucher numbers for quick lookup
    const permanentVoucherSet = new Set(
      (permanentVouchers || []).map((v) => v.voucherNumber)
    );

    const seenIds = new Set();

    inventory.forEach((row) => {
      if (row.status !== "ISSUED") return;

      const issuedHistory = (row.history || []).filter(
        (entry) => entry.action === "ISSUED"
      );
      const latestIssue = issuedHistory[issuedHistory.length - 1];
      if (
  !latestIssue ||
  latestIssue.policeStation !== selectedStation
) {
  return;
}

// Skip inventory issued to mobile vehicles
const voucher = permanentVouchers.find(
  (v) => v.voucherNumber === latestIssue.voucher
);

if (voucher?.mobileVehicle?.trim()) {
  return;
}

      const itemMeta = items.find((entry) => entry.name === row.item);

        const id = `${row.item}-${row.company}-${row.number}`;
        rows.push({
          id: `${row.item}-${row.company}-${row.number}`,
          name: row.item,
          company: row.company || "—",
          gpw: row.number,
          ivNo: latestIssue?.voucher || "—",
          lastUpdated: formatLastUpdated(
            latestIssue.updatedAt || latestIssue.time || latestIssue.date
          ),
        });
      seenIds.add(id);
    });
    // Only include items from Permanent IV vouchers. Also include commonExtras items
    permanentVouchers.forEach((voucher) => {
      if (voucher.policeStation !== selectedStation) return;

// Skip vouchers issued to mobile vehicles
if (voucher.mobileVehicle && voucher.mobileVehicle.trim() !== "") return;

      (voucher.items || []).forEach((entry, index) => {
        if (entry.received) return;

        const isCommonExtra = commonExtras.includes(entry.item);
        if (!entry.isExtra && !isCommonExtra) return;

        if (entry.isExtra) {
          const vid = `${voucher.voucherNumber}-extra-${index}`;
          if (seenIds.has(vid)) return;

          rows.push({
            id: vid,
            name: entry.item,
            company: entry.company || "—",
            gpw: entry.quantity || 1,
            ivNo: voucher.voucherNumber || "—",
            lastUpdated: formatLastUpdated(
              entry.updatedAt || voucher.generatedAt || voucher.issueDate
            ),
          });

          seenIds.add(vid);
        } else {
          // expand gpw/serial numbers and add per-number if not already present
          const numbers = expandNumbers(entry.gpwNumbers || "");
          if (numbers.length === 0) {
            // fallback to adding a single row when no explicit numbers available
            const vid = `${voucher.voucherNumber}-${index}`;
            if (seenIds.has(vid)) return;

            rows.push({
              id: vid,
              name: entry.item,
              company: entry.company || "—",
              gpw: entry.gpwNumbers || "—",
              ivNo: voucher.voucherNumber || "—",
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
  }, [selectedStation, inventory, issueVouchers, permanentVouchers]);

  return (
    <div className="police-station-data-page">
      <div className="police-station-data-header">
        <h2>Police Station Data</h2>
        <p>Active issued items are grouped by police station.</p>
      </div>

      {stationList.length === 0 ? (
        <div className="empty-card">
          No issue voucher has been created for any police station yet.
        </div>
      ) : (
        <div className="station-data-layout">
          <div className="station-list-panel">
            <h3>Police Stations</h3>
            <div className="station-list">
              {stationList.map((station) => (
                <button
                  key={station}
                  className={`station-chip ${
                    station === selectedStation ? "active" : ""
                  } ${highlightedStation === station ? "highlight-station" : ""}`}
                  onClick={() => setSelectedStation(station)}
                >
                  {station}
                </button>
              ))}
            </div>
          </div>

          <div className="station-details-panel">
            <h3>{selectedStation}</h3>

            {stationItems.length === 0 ? (
              <div className="empty-card">
                No active issued items found for this station.
              </div>
            ) : (
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
                  {stationItems.map((item) => (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PoliceStationData;
