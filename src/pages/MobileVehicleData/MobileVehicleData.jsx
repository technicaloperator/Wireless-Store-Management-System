import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../Context/StoreContext";
import { commonExtras } from "../../data/masterData";
import "./MobileVehicleData.css";

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

const buildStationItem = ({
  id,
  name,
  company,
  gpw,
  ivNo,
  mobileVehicle,
  lastUpdated,
}) => ({
  id,
  name,
  company: company || "—",
  gpw,
  ivNo,
  mobileVehicle: mobileVehicle || "—",
  lastUpdated: formatLastUpdated(lastUpdated),
});

const isVoucherVehicleEntry = (voucher, selectedVehicle) =>
  voucher.policeStation === selectedVehicle && voucher.mobileVehicle?.trim();

const isVoucherMobileVehicleEntry = (voucher) =>
  voucher.policeStation && voucher.mobileVehicle?.trim();

const isValidVoucherItem = (entry) => {
  const isCommonExtra = commonExtras.includes(entry.item);
  return entry.isExtra || isCommonExtra || !!entry.gpwNumbers;
};

const voucherHasActiveVehicleData = (voucher, inventory) => {
  const hasVoucherItems = (voucher.items || []).some(
    (entry) => !entry.received && isValidVoucherItem(entry)
  );
  if (hasVoucherItems) return true;

  return inventory.some((row) => {
    if (row.status !== "ISSUED") return false;

    const issuedHistory = (row.history || []).filter(
      (entry) => entry.action === "ISSUED"
    );
    const latestIssue = issuedHistory[issuedHistory.length - 1];
    return latestIssue?.voucher === voucher.voucherNumber;
  });
};

function MobileVehicleData() {
  const { inventory = [], permanentVouchers = [] } = useStore();

  const [highlightedVehicle, setHighlightedVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    const highlightVehicle = sessionStorage.getItem("highlight_vehicle");
    const highlightStation = sessionStorage.getItem("highlight_vehicle_station");

    if (highlightStation) {
      setSelectedVehicle(highlightStation);
    }

    if (highlightVehicle) {
      setHighlightedVehicle(highlightVehicle);
      setTimeout(() => setHighlightedVehicle(null), 2000);
    }

    sessionStorage.removeItem("highlight_vehicle");
    sessionStorage.removeItem("highlight_vehicle_station");
  }, []);

  const allVouchers = useMemo(() => permanentVouchers || [], [permanentVouchers]);

  const vehicleList = useMemo(() => {
    const stations = new Set();

    allVouchers.forEach((voucher) => {
      if (!isVoucherMobileVehicleEntry(voucher)) return;
      if (!voucherHasActiveVehicleData(voucher, inventory)) return;
      stations.add(voucher.policeStation);
    });

    return [...stations].sort();
  }, [allVouchers, inventory]);

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
    const seenIds = new Set();
    const voucherMap = new Map(allVouchers.map((voucher) => [voucher.voucherNumber, voucher]));

    inventory.forEach((row) => {
      if (row.status !== "ISSUED") return;

      const issuedHistory = (row.history || []).filter((entry) => entry.action === "ISSUED");
      const latestIssue = issuedHistory[issuedHistory.length - 1];
      if (!latestIssue) return;

      const voucher = voucherMap.get(latestIssue.voucher);
      if (!voucher || !isVoucherVehicleEntry(voucher, selectedVehicle)) return;

      const id = `${row.item}-${row.company}-${row.number}`;
      rows.push(
        buildStationItem({
          id,
          name: row.item,
          company: row.company,
          gpw: row.number,
          ivNo: latestIssue?.voucher || "—",
          mobileVehicle: voucher.mobileVehicle,
          lastUpdated: latestIssue.updatedAt || latestIssue.time || latestIssue.date,
        })
      );
      seenIds.add(id);
    });

    allVouchers.forEach((voucher) => {
      if (!isVoucherVehicleEntry(voucher, selectedVehicle)) return;

      (voucher.items || []).forEach((entry, index) => {
        if (entry.received || !isValidVoucherItem(entry)) return;

        const addRow = (id, gpw) => {
          if (seenIds.has(id)) return;

          rows.push(
            buildStationItem({
              id,
              name: entry.item,
              company: entry.company,
              gpw,
              ivNo: voucher.voucherNumber || "—",
              mobileVehicle: voucher.mobileVehicle,
              lastUpdated: entry.updatedAt || voucher.generatedAt || voucher.issueDate,
            })
          );
          seenIds.add(id);
        };

        if (entry.isExtra) {
          addRow(`${voucher.voucherNumber}-extra-${index}`, entry.quantity || 1);
          return;
        }

        const numbers = expandNumbers(entry.gpwNumbers || "");
        if (numbers.length === 0) {
          addRow(`${voucher.voucherNumber}-${index}`, entry.gpwNumbers || "—");
          return;
        }

        numbers.forEach((num) => {
          addRow(`${entry.item}-${entry.company}-${num}`, num);
        });
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
                    <div
                      key={mv}
                      className={`vehicle-group ${
                        highlightedVehicle === mv ? "highlight-vehicle" : ""
                      }`}
                    >
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
