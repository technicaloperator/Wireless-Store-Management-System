
import "./PermanentIV.css";
import { useStore } from "../../Context/StoreContext";
import IssueVoucher from "../Issue/IssueVoucher";
import { useEffect, useMemo, useState, useRef } from "react";


function PermanentIV() {
  const {
    inventory = [],
    setInventory,
    permanentVouchers = [],
    setPermanentVouchers,
    currentUser,
    addActivity,
  } = useStore();

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherToReceive, setVoucherToReceive] = useState(null);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
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
      const voucher = permanentVouchers.find((v) => v.voucherNumber === highlightVoucherNumber);
      if (voucher) {
        setSelectedVoucher(voucher);
      }
      // Remove highlight after 2 seconds
      setTimeout(() => setHighlightedVoucherNumber(null), 2000);
      sessionStorage.removeItem("highlight_voucher");
    }
  }, [permanentVouchers]);

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

  const formatVoucherItemLabel = (item) => {
    if (item.isExtra) {
      return `${item.item} x${item.quantity || 1}`;
    }
    return `${item.item} ${item.company} ${item.gpwNumbers}`;
  };

  const getVoucherReceivedItems = (voucher) =>
    (voucher.items || []).map((item) => ({
      ...item,
      received: item.received === true,
    }));

  const isVoucherFullyReceived = (voucher) =>
    getVoucherReceivedItems(voucher).length > 0 &&
    getVoucherReceivedItems(voucher).every((item) => item.received);

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

    const updatedVouchers = permanentVouchers.map((v) =>
      v.voucherNumber === voucher.voucherNumber
        ? { ...v, items: updatedItems }
        : v
    );

    const updatedVoucher = updatedVouchers.find(
      (v) => v.voucherNumber === voucher.voucherNumber
    );

    setPermanentVouchers(updatedVouchers);
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

      addActivity({
        module: "PERMANENT IV",
        action: "RECEIVE",
        details: item.isExtra
          ? `RECEIVED EXTRA ${item.item} x${item.quantity || 1}`
          : `RECEIVED ${item.item} ${item.company} ${item.gpwNumbers}`,
        user: currentUser,
      });
    }
  };

  const generatePdf = (voucher) => {
    setDownloadVoucher(voucher);

    setTimeout(async () => {
      if (downloadVoucherRef.current) {
        await downloadVoucherRef.current.downloadPdf(
          voucher.voucherNumber
        );
      }

      setDownloadVoucher(null);
    }, 150);
  };

  const deleteVoucher = () => {
    if (!voucherToDelete) return;

    const updated = permanentVouchers.filter(
      (v) => v.voucherNumber !== voucherToDelete.voucherNumber
    );

    setPermanentVouchers(updated);

    addActivity({
      module: "PERMANENT IV",
      action: "DELETE",
      details: `DELETED VOUCHER ${voucherToDelete.voucherNumber}`,
      user: currentUser,
    });

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

    const updatedVouchers = permanentVouchers.map((v) =>
      v.voucherNumber === voucherForRemarks.voucherNumber
        ? { ...v, remarks: remarksText }
        : v
    );

    setPermanentVouchers(updatedVouchers);

    addActivity({
      module: "PERMANENT IV",
      action: "REMARKS",
      details: `UPDATED REMARKS FOR ${voucherForRemarks.voucherNumber}`,
      user: currentUser,
    });

    setVoucherForRemarks(null);
    setRemarksText("");
  };
  useEffect(() => {
    if (selectedVoucher) {
      const exists = permanentVouchers.some(
        (v) => v.voucherNumber === selectedVoucher.voucherNumber
      );
      if (!exists) setSelectedVoucher(null);
    }

    if (voucherToReceive) {
      const exists = permanentVouchers.some(
        (v) => v.voucherNumber === voucherToReceive.voucherNumber
      );
      if (!exists) setVoucherToReceive(null);
    }
  }, [permanentVouchers, selectedVoucher, voucherToReceive]);

  return (
    <div className="permanent-page">
      <h2>Stored Voucher Records</h2>

      <div className="permanent-table-wrap">
        <table className="reports-table">
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
            {permanentVouchers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  NO PERMANENT IV RECORDS AVAILABLE
                </td>
              </tr>
            ) : (
              permanentVouchers.map((voucher, index) => {
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
                      <button className="view-btn" onClick={() => setSelectedVoucher(voucher)}>
                        VIEW
                      </button>
                      <button className="download-btn" onClick={() => generatePdf(voucher)}>
                        DOWNLOAD
                      </button>
                      <button className="receive-btn" onClick={() => setVoucherToReceive(voucher)} disabled={isVoucherFullyReceived(voucher)}>
                        RECEIVE
                      </button>
                      <button className="delete-btn" onClick={() => setVoucherToDelete(voucher)}>
                        DELETE
                      </button>
                      <button className={`remarks-btn ${!voucher.remarks ? "remarks-empty" : ""}`} onClick={() => openRemarksModal(voucher)}>
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
                  <div className="receive-item-label">{formatVoucherItemLabel(item)}</div>
                  <div className="receive-item-actions">
                    {item.received ? (
                      <span className="received-label">RECEIVED</span>
                    ) : (
                      <button className="receive-item-btn" onClick={() => markItemReceived(voucherToReceive, index)}>
                        RECEIVE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="receive-close-row">
              <button className="cancel-delete-btn" onClick={() => setVoucherToReceive(null)}>
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
            <p>Are you sure you want to delete this voucher?</p>
            <div className="delete-buttons">
              <button className="cancel-delete-btn" onClick={() => setVoucherToDelete(null)}>
                CANCEL
              </button>
              <button className="confirm-delete-btn" onClick={deleteVoucher}>
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

export default PermanentIV;
