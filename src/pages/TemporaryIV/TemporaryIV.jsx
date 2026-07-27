import { useEffect, useMemo, useState, useRef } from "react";
import { useStore } from "../../Context/StoreContext";
import IssueVoucher from "../Issue/IssueVoucher";
import "./TemporaryIV.css";

function TemporaryIV() {
  const {
    inventory = [],
    setInventory,
    issueVouchers = [],
    setIssueVouchers,
    currentUser,
    addActivity,
  } = useStore();

  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherToReceive, setVoucherToReceive] = useState(null);
  const [voucherForRemarks, setVoucherForRemarks] = useState(null);
  const [remarksText, setRemarksText] = useState("");
  const [highlightedVoucherNumber, setHighlightedVoucherNumber] = useState(null);
  const downloadVoucherRef = useRef(null);
  const [downloadVoucher, setDownloadVoucher] = useState(null);

  // Handle search navigation highlighting
  useEffect(() => {
    const highlightVoucherNumber = sessionStorage.getItem("highlight_voucher");
    if (highlightVoucherNumber) {
      setHighlightedVoucherNumber(highlightVoucherNumber);
      const voucher = issueVouchers.find((v) => v.voucherNumber === highlightVoucherNumber);
      if (voucher) {
        setSelectedVoucher(voucher);
      }
      // Remove highlight after 2 seconds
      setTimeout(() => setHighlightedVoucherNumber(null), 2000);
      sessionStorage.removeItem("highlight_voucher");
    }
  }, [issueVouchers]);

  useEffect(() => {
    if (selectedVoucher) {
      const exists = issueVouchers.some(
        (v) => v.voucherNumber === selectedVoucher.voucherNumber
      );
      if (!exists) {
        setSelectedVoucher(null);
      }
    }

    if (voucherToReceive) {
      const exists = issueVouchers.some(
        (v) => v.voucherNumber === voucherToReceive.voucherNumber
      );
      if (!exists) {
        setVoucherToReceive(null);
      }
    }
  }, [issueVouchers, selectedVoucher, voucherToReceive]);

  const expandNumbers = (text) => {
    if (!text) return [];

    const list = [];
    text.split(",").forEach((part) => {
      part = part.trim();
      if (!part) return;

      if (part.includes("-")) {
        const [from, to] = part.split("-").map(Number);
        for (let i = from; i <= to; i++) {
          list.push(i.toString());
        }
      } else {
        list.push(part);
      }
    });

    return list;
  };

  const makeRanges = (text) => {
    const numbers = expandNumbers(text);
    if (numbers.length === 0) return [];

    const ranges = [];
    let start = Number(numbers[0]);
    let end = Number(numbers[0]);

    for (let i = 1; i < numbers.length; i++) {
      const current = Number(numbers[i]);
      if (current === end + 1) {
        end = current;
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = current;
        end = current;
      }
    }

    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges;
  };

  const totalVoucherCount = issueVouchers.length;

  const totalIssuedQuantity = useMemo(() => {
    return issueVouchers.reduce((sum, voucher) => {
      const voucherTotal = (voucher.items || []).reduce((itemSum, entry) => {
        if (entry.isExtra) {
          return itemSum + (entry.quantity || 0);
        }
        return itemSum + expandNumbers(entry.gpwNumbers).length;
      }, 0);
      return sum + voucherTotal;
    }, 0);
  }, [issueVouchers]);

  const totalReceivedBack = useMemo(() => {
    return issueVouchers.reduce((sum, voucher) => {
      const receivedCount = (voucher.items || []).reduce((itemSum, entry) => {
        if (!entry.received) return itemSum;
        if (entry.isExtra) {
          return itemSum + (entry.quantity || 0);
        }
        return itemSum + expandNumbers(entry.gpwNumbers).length;
      }, 0);
      return sum + receivedCount;
    }, 0);
  }, [issueVouchers]);

  const parseIssueDate = (issueDate) => {
    if (!issueDate) return null;
    const [day, month, year] = issueDate.split("-").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const getMonthKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  const countVoucherItems = (items) =>
    (items || []).reduce((sum, entry) => {
      if (entry.isExtra) {
        return sum + (entry.quantity || 0);
      }
      return sum + expandNumbers(entry.gpwNumbers).length;
    }, 0);

  const countReceivedItems = (items) =>
    (items || []).reduce((sum, entry) => {
      if (!entry.received) return sum;
      if (entry.isExtra) {
        return sum + (entry.quantity || 0);
      }
      return sum + expandNumbers(entry.gpwNumbers).length;
    }, 0);

  const currentMonthKey = getMonthKey(new Date());
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthKey = getMonthKey(previousMonthDate);

  const monthlySummary = [currentMonthKey, previousMonthKey].map((monthKey) => {
    const vouchersForMonth = issueVouchers.filter((voucher) => {
      const issueDate = parseIssueDate(voucher.issueDate);
      return issueDate && getMonthKey(issueDate) === monthKey;
    });

    return {
      monthKey,
      monthLabel: getMonthLabel(monthKey),
      voucherCount: vouchersForMonth.length,
      issuedCount: vouchersForMonth.reduce(
        (sum, voucher) => sum + countVoucherItems(voucher.items),
        0
      ),
      receivedCount: vouchersForMonth.reduce(
        (sum, voucher) => sum + countReceivedItems(voucher.items),
        0
      ),
    };
  });

  const getVoucherReceivedItems = (voucher) =>
    (voucher.items || []).map((item) => ({
      ...item,
      received: item.received === true,
    }));

  const isVoucherFullyReceived = (voucher) =>
    getVoucherReceivedItems(voucher).length > 0 &&
    getVoucherReceivedItems(voucher).every((item) => item.received);

  const formatVoucherItemLabel = (item) => {
    if (item.isExtra) {
      return `${item.item} x${item.quantity || 1}`;
    }
    return `${item.item} ${item.company} ${item.gpwNumbers}`;
  };

  const markItemReceived = (voucher, itemIndex) => {
    const item = voucher.items[itemIndex];
    if (!item || item.received) return;

    const updatedItems = voucher.items.map((entry, idx) =>
      idx === itemIndex
        ? {
            ...entry,
            received: true,
            updatedAt: new Date().toISOString(),
          }
        : entry
    );

    const updatedVouchers = issueVouchers.map((v) =>
      v.voucherNumber === voucher.voucherNumber
        ? {
            ...v,
            items: updatedItems,
          }
        : v
    );

    const updatedVoucher = updatedVouchers.find(
      (v) => v.voucherNumber === voucher.voucherNumber
    );

    setIssueVouchers(updatedVouchers);
    setVoucherToReceive(updatedVoucher || voucher);

    if (!item.isExtra) {
      const numbers = expandNumbers(item.gpwNumbers);
      const updatedInventory = inventory.map((row) => {
        if (
          numbers.includes(row.number) &&
          row.item === item.item &&
          row.company === item.company &&
          row.status === "ISSUED"
        ) {
          return {
            ...row,
            status: "AVAILABLE",
            history: [
              ...(row.history || []),
              {
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                updatedAt: new Date().toISOString(),
                action: "RECEIVED",
                policeStation: voucher.policeStation,
                voucher: voucher.voucherNumber,
              },
            ],
          };
        }
        return row;
      });

      setInventory(updatedInventory);
    }

   addActivity({
    module: "TEMPORARY IV",
    action: "RECEIVE",
    details: item.isExtra
        ? `RECEIVED EXTRA ${item.item} x${item.quantity || 1}`
        : `RECEIVED ${item.item} ${item.company} ${item.gpwNumbers}`,
    user: currentUser,
});
  };

  const generatePdf = (voucher) => {


  setDownloadVoucher(voucher);

  setTimeout(async () => {
    

    if (downloadVoucherRef.current) {
      
      await downloadVoucherRef.current.downloadPdf(voucher.voucherNumber);
    } else {
      
    }

    setDownloadVoucher(null);
  }, 150);
};
  const deleteVoucher = () => {
  if (!voucherToDelete) return;

  const updated = issueVouchers.filter(
    (v) => v.voucherNumber !== voucherToDelete.voucherNumber
  );

  // Remove the voucher reference only. Do not auto-receive inventory items.
  setIssueVouchers(updated);

  if (selectedVoucher?.voucherNumber === voucherToDelete.voucherNumber) {
    setSelectedVoucher(null);
  }

  setVoucherToDelete(null);
};

  const openRemarksModal = (voucher) => {
    setVoucherForRemarks(voucher);
    setRemarksText(voucher.remarks || "");
  };

  const saveRemarks = () => {
    if (!voucherForRemarks) return;

    const updatedVouchers = issueVouchers.map((v) =>
      v.voucherNumber === voucherForRemarks.voucherNumber
        ? { ...v, remarks: remarksText }
        : v
    );

    setIssueVouchers(updatedVouchers);
    setVoucherForRemarks(null);
    setRemarksText("");
  };

  return (
    <div className="temporary-page">
      <h2>Temporary IV</h2>

      <div className="temporary-summary-grid">
        <div className="temporary-card">
          <h3>Issued Vouchers</h3>
          <h1>{totalVoucherCount}</h1>
        </div>
        <div className="temporary-card">
          <h3>Total Items Issued</h3>
          <h1>{totalIssuedQuantity}</h1>
        </div>
        <div className="temporary-card">
          <h3>Total Items Received Back</h3>
          <h1>{totalReceivedBack}</h1>
        </div>
      </div>

      <div className="temporary-monthly-card">
        <h3>Monthly Summary</h3>
        <table className="monthly-summary-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Issued Vouchers</th>
              <th>Total Items Issued</th>
              <th>Total Items Received Back</th>
            </tr>
          </thead>
          <tbody>
            {monthlySummary.map((summary) => (
              <tr key={summary.monthKey}>
                <td>{summary.monthLabel}</td>
                <td>{summary.voucherCount}</td>
                <td>{summary.issuedCount}</td>
                <td>{summary.receivedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="temporary-table-card">
        <h3>Stored Voucher Records</h3>
        <table className="temporary-table">
          <thead>
            <tr>
              <th>SERIAL</th>
              <th>DATE</th>
              <th>IV NO.</th>
              <th>POLICE STATION</th>
                      <th>ITEMS</th>
              <th style={{ minWidth: "260px" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {issueVouchers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  NO ISSUE VOUCHERS AVAILABLE
                </td>
              </tr>
            ) : (
              issueVouchers.map((voucher, index) => {
                const formatItemNames = (items) => {
                  const names = (items || []).map((e) => e.item).filter(Boolean);
                  return [...new Set(names)].join(", ");
                };
                return (
                  <tr key={voucher.voucherNumber || index} className={highlightedVoucherNumber === voucher.voucherNumber ? "highlight-row" : ""}>
                    <td>{index + 1}</td>
                    <td>{voucher.issueDate}</td>
                    <td>{voucher.voucherNumber}</td>
                    <td>
  <div>{voucher.policeStation}</div>

  {voucher.mobileVehicle?.trim() && (
    <div
      style={{
        fontSize: "12px",
        color: "#555",
        fontWeight: "500",
        marginTop: "2px",
      }}
    >
      ({voucher.mobileVehicle})
    </div>
  )}
</td>
                    <td>{formatItemNames(voucher.items)}</td>
                        <td className="actions-cell">
                      <button
                        className="view-btn"
                        onClick={() => setSelectedVoucher(voucher)}
                      >
                        VIEW
                      </button>
                      <button
                        className="download-btn"
                        onClick={() => generatePdf(voucher)}
                      >
                        DOWNLOAD
                      </button>
                      <button
                        className="receive-btn"
                        onClick={() => setVoucherToReceive(voucher)}
                        disabled={isVoucherFullyReceived(voucher)}
                      >
                        RECEIVE
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => setVoucherToDelete(voucher)}
                      >
                        DELETE
                      </button>
                      <button
                        className={`remarks-btn ${!voucher.remarks ? "remarks-empty" : ""}`}
                        onClick={() => openRemarksModal(voucher)}
                      >
                        DR
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedVoucher && (
        <IssueVoucher
          voucherNumber={selectedVoucher.voucherNumber}
          issueDate={selectedVoucher.issueDate}
          designation={selectedVoucher.designation}
          policeStation={selectedVoucher.policeStation}
          district={selectedVoucher.district}
          mobileVehicle={selectedVoucher.mobileVehicle}
          indentNo={selectedVoucher.indentNo}
          indentDate={selectedVoucher.indentDate}
          items={selectedVoucher.items}
          onClose={() => setSelectedVoucher(null)}
        />
      )}

      {voucherToReceive && (
        <div className="receive-overlay">
          <div className="receive-dialog">
            <h2>RECEIVE VOUCHER ITEMS</h2>
            <p>
              Voucher <strong>{voucherToReceive.voucherNumber}</strong>
            </p>
            <div className="receive-items-list">
              {(voucherToReceive.items || []).map((item, index) => (
                <div key={index} className="receive-item-row">
                  <div className="receive-item-label">
                    {formatVoucherItemLabel(item)}
                  </div>
                  <div className="receive-item-actions">
                    {item.received ? (
                      <span className="received-label">RECEIVED</span>
                    ) : (
                      <button
                        className="receive-item-btn"
                        onClick={() => markItemReceived(voucherToReceive, index)}
                      >
                        RECEIVE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="receive-close-row">
              <button
                className="cancel-delete-btn"
                onClick={() => setVoucherToReceive(null)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
            {voucherToDelete && (
        <div className="delete-overlay">
          <div className="delete-dialog">

            <h2>DELETE ISSUE VOUCHER</h2>

            <p>
              Are you sure you want to delete this voucher?
            </p>

            <h3>{voucherToDelete.voucherNumber}</h3>

            <p className="delete-warning">
              This action cannot be undone.
            </p>

            <div className="delete-buttons">

              <button
                className="cancel-delete-btn"
                onClick={() => setVoucherToDelete(null)}
              >
                CANCEL
              </button>

              <button
                className="confirm-delete-btn"
                onClick={deleteVoucher}
              >
                DELETE
              </button>

            </div>

          </div>
        </div>
      )}
      {voucherForRemarks && (
        <div className="remarks-overlay">
          <div className="remarks-dialog">
            <h2>REMARKS</h2>
            <p>Voucher <strong>{voucherForRemarks.voucherNumber}</strong></p>
            <textarea
              className="remarks-textarea"
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              placeholder="Enter your remarks here..."
            />
            <div className="remarks-buttons">
              <button className="cancel-delete-btn" onClick={() => {
                setVoucherForRemarks(null);
                setRemarksText("");
              }}>
                CANCEL
              </button>
              <button className="confirm-delete-btn" onClick={saveRemarks}>
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
      {downloadVoucher && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      opacity: 0,
      pointerEvents: "none",
      zIndex: -1,
    }}
  >
    <IssueVoucher
      ref={downloadVoucherRef}
      voucherNumber={downloadVoucher.voucherNumber}
      issueDate={downloadVoucher.issueDate}
      designation={downloadVoucher.designation}
      policeStation={downloadVoucher.policeStation}
      district={downloadVoucher.district}
      mobileVehicle={downloadVoucher.mobileVehicle}
      indentNo={downloadVoucher.indentNo}
      indentDate={downloadVoucher.indentDate}
      items={downloadVoucher.items}
      onClose={() => {}}
    />
  </div>
)}
    </div>
  );
}

export default TemporaryIV;
