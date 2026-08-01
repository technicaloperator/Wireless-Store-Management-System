import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../Context/StoreContext";
import { commonExtras } from "../../data/masterData";
import "./PoliceStationData.css";

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

const getLastUpdatedValue = (entry, voucher) =>
  entry.updatedAt || voucher.generatedAt || voucher.issueDate;

const hasMobileVehicle = (voucher) =>
  !!voucher?.mobileVehicle?.trim();

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

const buildStationRow = ({ id, name, company, gpw, ivNo, lastUpdated }) => ({
  id,
  name,
  company: company || "—",
  gpw,
  ivNo,
  lastUpdated: formatLastUpdated(lastUpdated),
});

function PoliceStationData() {
  const {
    inventory = [],
    permanentVouchers = [],
  } = useStore();

  const [highlightedStation, setHighlightedStation] = useState(null);
  const [selectedStation, setSelectedStation] = useState("");

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

  const stationList = useMemo(() => {
    const stations = new Set();

    const addStation = (station) => {
      if (station) stations.add(station);
    };

    inventory.forEach((row) => {
      if (row.status !== "ISSUED") return;

      const issuedHistory = (row.history || []).filter(
        (entry) => entry.action === "ISSUED"
      );
      const latestIssue = issuedHistory[issuedHistory.length - 1];
      if (!latestIssue) return;

      const voucher = permanentVouchers.find(
        (v) => v.voucherNumber === latestIssue.voucher
      );
      if (!voucher || hasMobileVehicle(voucher)) return;

      addStation(latestIssue.policeStation);
    });

    permanentVouchers.forEach((voucher) => {
      if (hasMobileVehicle(voucher) || !voucher.policeStation) return;

      const hasActiveItems = (voucher.items || []).some((entry) => {
        if (entry.received) return false;
        const isCommonExtra = commonExtras.includes(entry.item);
        return entry.isExtra || isCommonExtra;
      });

      if (hasActiveItems) {
        addStation(voucher.policeStation);
      }
    });

    return [...stations];
  }, [inventory, permanentVouchers]);

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
    const seenIds = new Set();

    inventory.forEach((row) => {
      if (row.status !== "ISSUED") return;

      const issuedHistory = (row.history || []).filter(
        (entry) => entry.action === "ISSUED"
      );
      const latestIssue = issuedHistory[issuedHistory.length - 1];
      if (!latestIssue || latestIssue.policeStation !== selectedStation) {
        return;
      }

      // Skip inventory issued to mobile vehicles
      const voucher = permanentVouchers.find(
        (v) => v.voucherNumber === latestIssue.voucher
      );
      if (!voucher || hasMobileVehicle(voucher)) {
        return;
      }

      const id = `${row.item}-${row.company}-${row.number}`;
      rows.push(
        buildStationRow({
          id,
          name: row.item,
          company: row.company,
          gpw: row.number,
          ivNo: latestIssue?.voucher || "—",
          lastUpdated: latestIssue.updatedAt || latestIssue.time || latestIssue.date,
        })
      );
      seenIds.add(id);
    });
    // Only include items from Permanent IV vouchers. Also include commonExtras items
    permanentVouchers.forEach((voucher) => {
      if (voucher.policeStation !== selectedStation) return;
      if (hasMobileVehicle(voucher)) return;

      (voucher.items || []).forEach((entry, index) => {
        if (entry.received) return;

        const isCommonExtra = commonExtras.includes(entry.item);
        if (!entry.isExtra && !isCommonExtra) return;

        if (entry.isExtra) {
          const vid = `${voucher.voucherNumber}-extra-${index}`;
          if (seenIds.has(vid)) return;

          rows.push(
            buildStationRow({
              id: vid,
              name: entry.item,
              company: entry.company,
              gpw: entry.quantity || 1,
              ivNo: voucher.voucherNumber || "—",
              lastUpdated: getLastUpdatedValue(entry, voucher),
            })
          );

          seenIds.add(vid);
        } else {
          const numbers = expandNumbers(entry.gpwNumbers || "");
          if (numbers.length === 0) {
            const vid = `${voucher.voucherNumber}-${index}`;
            if (seenIds.has(vid)) return;

            rows.push(
              buildStationRow({
                id: vid,
                name: entry.item,
                company: entry.company,
                gpw: entry.gpwNumbers || "—",
                ivNo: voucher.voucherNumber || "—",
                lastUpdated: getLastUpdatedValue(entry, voucher),
              })
            );

            seenIds.add(vid);
          } else {
            numbers.forEach((num) => {
              const id = `${entry.item}-${entry.company}-${num}`;
              if (seenIds.has(id)) return;

              rows.push(
                buildStationRow({
                  id,
                  name: entry.item,
                  company: entry.company,
                  gpw: num,
                  ivNo: voucher.voucherNumber || "—",
                  lastUpdated: getLastUpdatedValue(entry, voucher),
                })
              );

              seenIds.add(id);
            });
          }
        }
      });
    });

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedStation, inventory, permanentVouchers]);

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
