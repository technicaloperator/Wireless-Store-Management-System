import { useMemo, useState } from "react";
import "./Issue.css";
import IssueVoucher from "./IssueVoucher";

import { useStore } from "../../Context/StoreContext";
import { items, commonExtras } from "../../data/masterData";
import {
  designations,
  policeStations,
  districts,
} from "../../data/policeData";

function Issue() {
  const {
    inventory,
    setInventory,
    issueVouchers,
    setIssueVouchers,
    permanentVouchers,
    setPermanentVouchers,
    currentUser,
    addActivity,
  } = useStore();

  const [ivType, setIvType] = useState("TEMPORARY");
  const [item, setItem] = useState("HHMD");
  const [company, setCompany] = useState("");

  const [designation, setDesignation] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [district, setDistrict] = useState("");

  const [isExtraItem, setIsExtraItem] = useState(false);
  const [extraItemName, setExtraItemName] = useState("");
  const [extraQuantity, setExtraQuantity] = useState("");
  const [indentNo, setIndentNo] = useState("");
  const [indentDate, setIndentDate] = useState("");
  const [mobileVehicle, setMobileVehicle] = useState("");
  const [issueDate, setIssueDate] = useState(() => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
  });

  const [gpwNumbers, setGpwNumbers] = useState("");
  const [issueList, setIssueList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [showVoucher, setShowVoucher] = useState(false);

  const [voucherData, setVoucherData] = useState(null);

  const currentItem = useMemo(() => {
    return items.find((x) => x.name === item);
  }, [item]);

  const availableItems = inventory.filter(
    (x) =>
      x.item === item &&
      x.company === company &&
      x.status === "AVAILABLE"
  );

  const formatDateForInput = (value) => {
    if (!value) return "";
    const [day, month, year] = value.split("-");
    if (!day || !month || !year) return "";
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return "";
    return `${day}-${month}-${year}`;
  };

  const generateVoucherNumber = () => {
    const year = new Date().getFullYear();
    
    if (ivType === "TEMPORARY") {
      const tempVouchersThisYear = issueVouchers.filter((v) =>
        v.voucherNumber.startsWith(`IV/T/${year}/`)
      );
      const next = String(tempVouchersThisYear.length + 1).padStart(3, "0");
      return `IV/T/${year}/${next}`;
    } else {
      const permVouchersThisYear = permanentVouchers.filter((v) =>
        v.voucherNumber.startsWith(`IV/P/${year}/`)
      );
      const next = String(permVouchersThisYear.length + 1).padStart(3, "0");
      return `IV/P/${year}/${next}`;
    }
  };

  const expandNumbers = (text) => {
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

  const resetAddForm = () => {
    setItem("HHMD");
    setCompany("");
    setGpwNumbers("");
    setIsExtraItem(false);
    setExtraItemName("");
    setExtraQuantity("");
    setEditingIndex(null);
  };

  const addInventoryItem = () => {
    if (!company) {
      alert("SELECT COMPANY");
      return;
    }

    if (!gpwNumbers.trim()) {
      alert("ENTER GPW / SERIAL NUMBER");
      return;
    }

    // Expand and validate GPW numbers against inventory
    const expandedNumbers = expandNumbers(gpwNumbers);
    
    if (expandedNumbers.length === 0) {
      alert("ENTER VALID GPW / SERIAL NUMBER");
      return;
    }

    const notFound = [];
    const unavailable = [];

    expandedNumbers.forEach((num) => {
      const record = inventory.find(
        (x) =>
          x.item === item &&
          x.company === company &&
          x.number === num
      );

      if (!record) {
        notFound.push(num);
      } else if (record.status !== "AVAILABLE") {
        unavailable.push(num);
      }
    });

    if (notFound.length) {
      alert(
        "FOLLOWING NUMBER(S) NOT FOUND IN INVENTORY\n\n" +
          [...new Set(notFound)].join(", ")
      );
      return;
    }

    if (unavailable.length) {
      alert(
        "FOLLOWING NUMBER(S) NOT AVAILABLE\n\n" +
          [...new Set(unavailable)].join(", ")
      );
      return;
    }

    const itemData = {
      item,
      company,
      gpwNumbers,
      isExtra: false,
    };

    const updated = [...issueList];
    if (
      editingIndex !== null &&
      issueList[editingIndex] &&
      !issueList[editingIndex].isExtra
    ) {
      updated[editingIndex] = itemData;
      setIssueList(updated);
      setEditingIndex(null);
    } else {
      setIssueList([...issueList, itemData]);
    }

    setGpwNumbers("");
    setIsExtraItem(false);
  };

  const addExtraItem = () => {
    if (!extraItemName.trim()) {
      alert("ENTER ITEM NAME");
      return;
    }

    if (!extraQuantity.trim() || Number(extraQuantity) <= 0) {
      alert("ENTER QUANTITY");
      return;
    }

    const itemData = {
      item: extraItemName.trim(),
      company: "",
      quantity: Number(extraQuantity),
      isExtra: true,
    };

    const updated = [...issueList];
    if (
      editingIndex !== null &&
      issueList[editingIndex] &&
      issueList[editingIndex].isExtra
    ) {
      updated[editingIndex] = itemData;
      setIssueList(updated);
      setEditingIndex(null);
    } else {
      setIssueList([...issueList, itemData]);
    }

    resetAddForm();
  };

  const editIssueItem = (index) => {
    const selected = issueList[index];

    if (selected.isExtra) {
      setIsExtraItem(true);
      setExtraItemName(selected.item);
      setExtraQuantity(String(selected.quantity || ""));
      setCompany("");
      setGpwNumbers("");
    } else {
      setIsExtraItem(false);
      setItem(selected.item);
      setCompany(selected.company);
      setGpwNumbers(selected.gpwNumbers);
      setExtraItemName("");
      setExtraQuantity("");
    }

    setEditingIndex(index);
  };

  const removeIssueItem = (index) => {
    setIssueList(issueList.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setGpwNumbers("");
    }
  };

  const previewVoucher = () => {
    if (issueList.length === 0) {
      alert("ADD ITEMS TO ISSUE LIST FIRST");
      return;
    }

    if (!designation || !policeStation) {
      alert("SELECT DESIGNATION AND POLICE STATION BEFORE PREVIEW");
      return;
    }

    if (!issueDate) {
      alert("SELECT DATE OF ISSUE BEFORE PREVIEW");
      return;
    }

    const voucherNumber = generateVoucherNumber();

    setVoucherData({
      voucherNumber,
      issueDate,
      designation,
      policeStation,
      district,
      mobileVehicle,
      indentNo,
      indentDate,
      items: issueList,
    });

    setShowVoucher(true);
  };

  const issueItems = () => {
    if (issueList.length === 0) {
      alert("ADD ITEMS TO ISSUE LIST FIRST");
      return;
    }

    if (!designation || !policeStation) {
      alert("SELECT DESIGNATION AND POLICE STATION BEFORE ISSUE");
      return;
    }

    if (!issueDate) {
      alert("SELECT DATE OF ISSUE BEFORE ISSUE");
      return;
    }

    const issueEntries = issueList.map((entry) => ({
      ...entry,
      numbers: entry.isExtra ? [] : expandNumbers(entry.gpwNumbers),
    }));

    const notFound = [];
    const unavailable = [];

    issueEntries
      .filter((entry) => !entry.isExtra)
      .forEach((entry) => {
        entry.numbers.forEach((num) => {
          const record = inventory.find(
            (x) =>
              x.item === entry.item &&
              x.company === entry.company &&
              x.number === num
          );

          if (!record) {
            notFound.push(num);
          } else if (record.status !== "AVAILABLE") {
            unavailable.push(num);
          }
        });
      });

    if (notFound.length) {
      alert(
        "FOLLOWING NUMBER(S) NOT FOUND\n\n" +
          [...new Set(notFound)].join(", ")
      );
      return;
    }

    if (unavailable.length) {
      alert(
        "FOLLOWING NUMBER(S) NOT AVAILABLE\n\n" +
          [...new Set(unavailable)].join(", ")
      );
      return;
    }

    const voucherNumber = generateVoucherNumber();

    const pdfData = null;

    const updatedInventory = inventory.map((row) => {
      const matchingEntry = issueEntries.find(
        (entry) =>
          !entry.isExtra &&
          entry.item === row.item &&
          entry.company === row.company &&
          entry.numbers.includes(row.number)
      );

      if (!matchingEntry) return row;

      return {
        ...row,
        status: "ISSUED",
        history: [
          ...(row.history || []),
          {
            action: "ISSUED",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            updatedAt: new Date().toISOString(),
            designation,
            policeStation,
            district,
            voucher: voucherNumber,
          },
        ],
      };
    });

    setInventory(updatedInventory);

    const voucherRecord = {
      ivType,
      voucherNumber,
      issueDate,
      designation,
      policeStation,
      district,
      mobileVehicle,
      indentNo,
      indentDate,
      items: issueList.map((entry) => ({
        ...entry,
        updatedAt: new Date().toISOString(),
      })),
      
      generatedAt: new Date().toISOString(),
    };

    if (ivType === "PERMANENT") {
      setPermanentVouchers([...permanentVouchers, voucherRecord]);
    } else {
      setIssueVouchers([...issueVouchers, voucherRecord]);
    }


    const serialDetails = issueList
      .filter((entry) => !entry.isExtra)
      .map((entry) => `${entry.item} ${entry.company} ${entry.gpwNumbers}`)
      .join("; ");

    const extraDetails = issueList
      .filter((entry) => entry.isExtra)
      .map((entry) => `${entry.item} x${entry.quantity}`)
      .join("; ");

    const activityText = [
      serialDetails ? `ISSUED ${serialDetails}` : null,
      extraDetails ? `ISSUED ${extraDetails}` : null,
    ]
      .filter(Boolean)
      .join("; ") || `ISSUED ${issueList.length} ITEM(S)`;

addActivity({
  module: ivType === "PERMANENT"
    ? "PERMANENT IV"
    : "TEMPORARY IV",
  action: "ISSUE",
  details: activityText,
  user: currentUser,
});

    setVoucherData({
      ...voucherRecord,
    });

    setShowVoucher(true);
    setIssueList([]);
    setEditingIndex(null);
    setGpwNumbers("");
  };

  return (
  <div className="issue-page">

    <div className="issue-card">

      <h2>ISSUE VOUCHER</h2>

      <div className="issue-grid">

        <div className="section-box">

          <div className="form-group">
            <label>IV TYPE</label>
            <select
              value={ivType}
              onChange={(e) => setIvType(e.target.value)}
            >
              <option value="TEMPORARY">Temporary IV</option>
              <option value="PERMANENT">Permanent IV</option>
            </select>
          </div>

          <div className="form-group">
            <label>ITEM</label>

            <select
              value={item}
              onChange={(e) => {
                setItem(e.target.value);
                setCompany("");
                setIsExtraItem(false);
              }}
              disabled={isExtraItem}
            >
              {items.map((x) => (
                <option key={x.id} value={x.name}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>COMPANY</label>

            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isExtraItem}
            >
              <option value="">SELECT COMPANY</option>

              {(currentItem?.companies || []).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              {isExtraItem
                ? "NO SERIAL / GPW NO."
                : item === "BATTERY" || item === "SMPS"
                ? "SERIAL NO."
                : "GPW NO."}
            </label>

            <textarea
              rows={3}
              placeholder={
                isExtraItem
                  ? "THIS ITEM HAS NO SERIAL / GPW NUMBER"
                  : "25,26,27 OR 25-30"
              }
              value={gpwNumbers}
              onChange={(e) =>
                setGpwNumbers(e.target.value)
              }
              disabled={isExtraItem}
            />
          </div>

          <div className="form-group full-width">
            <button
              type="button"
              className="add-list-btn"
              onClick={addInventoryItem}
            >
              ADD TO ISSUE LIST
            </button>
          </div>
        </div>

        <div className="section-box">

          <div className="form-group">
            <label>ADD EXTRA ITEM</label>
            <input
              type="text"
              list="extra-item-list"
              value={extraItemName}
              onChange={(e) => {
                setExtraItemName(e.target.value);
              }}
              placeholder="SELECT OR TYPE EXTRA ITEM"
            />
            <datalist id="extra-item-list">
              {commonExtras.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label>QUANTITY</label>
            <input
              type="number"
              min="1"
              value={extraQuantity}
              onChange={(e) => {
                setExtraQuantity(e.target.value);
              }}
              placeholder="ENTER QUANTITY"
            />
          </div>

          <div className="form-group full-width">
            <button
              type="button"
              className="add-list-btn"
              onClick={addExtraItem}
            >
              ADD TO ISSUE LIST
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>DATE OF ISSUE</label>
          <input
            type="date"
            value={formatDateForInput(issueDate)}
            onChange={(e) => setIssueDate(formatDateForDisplay(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>DESIGNATION</label>

          <input
            list="designation-list"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="SELECT OR TYPE DESIGNATION"
          />

          <datalist id="designation-list">
            {designations.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label>POLICE STATION</label>

          <input
            list="police-station-list"
            value={policeStation}
            onChange={(e) => setPoliceStation(e.target.value)}
            placeholder="SELECT OR TYPE POLICE STATION"
          />

          <datalist id="police-station-list">
            {policeStations.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label>DISTRICT / CITY (OPTIONAL)</label>

          <input
            list="district-list"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="OPTIONAL"
          />

          <datalist id="district-list">
            {districts.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label>MOBILE VEHICLE (OPTIONAL)</label>
          <input
            type="text"
            value={mobileVehicle}
            onChange={(e) => setMobileVehicle(e.target.value.toUpperCase())}
            placeholder="OPTIONAL"
          />
        </div>

        <div className="form-group">
          <label>INDENT NO.</label>
          <input
            type="text"
            value={indentNo}
            onChange={(e) => setIndentNo(e.target.value)}
            placeholder="OPTIONAL"
          />
        </div>

        <div className="form-group">
          <label>INDENT DATED</label>
          <input
            type="date"
            value={formatDateForInput(indentDate)}
            onChange={(e) => setIndentDate(formatDateForDisplay(e.target.value))}
          />
        </div>

        

</div>

      <div className="issue-actions">
        <button
          className="preview-btn"
          onClick={previewVoucher}
        >
          PREVIEW VOUCHER
        </button>

        <button
          className="issue-button"
          onClick={issueItems}
        >
          ISSUE ITEMS
        </button>
      </div>

    </div>

    <div className="available-card">

      <h2>AVAILABLE ITEMS</h2>

      <table className="available-table">

        <thead>

          <tr>

            <th>
              {item === "BATTERY" || item === "SMPS"
                ? "SERIAL NO."
                : "GPW NO."}
            </th>

            <th>STATUS</th>

          </tr>

        </thead>

        <tbody>

          {availableItems.length === 0 ? (

            <tr>

              <td colSpan="2">
                NO AVAILABLE ITEMS
              </td>

            </tr>

          ) : (

            availableItems.map((row) => (

              <tr key={row.id}>

                <td>{row.number}</td>

                <td>{row.status}</td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      <h2>SELECTED ITEMS</h2>

      <table className="available-table selected-table">

        <thead>

          <tr>
            <th>ITEM</th>
            <th>COMPANY</th>
            <th>
              {item === "BATTERY" || item === "SMPS"
                ? "SERIAL NO."
                : "GPW NO."}
            </th>
            <th>ACTIONS</th>
          </tr>

        </thead>

        <tbody>
          {issueList.length === 0 ? (
            <tr>
              <td colSpan="4">NO ITEMS ADDED</td>
            </tr>
          ) : (
            issueList.map((row, index) => (
              <tr key={`${row.item}-${row.company}-${index}`}>
                <td>{row.item}</td>
                <td>{row.company || "-"}</td>
                <td>{row.isExtra ? `QTY: ${row.quantity}` : row.gpwNumbers}</td>
                <td>
                  <button
                    className="history-btn"
                    onClick={() => editIssueItem(index)}
                  >
                    EDIT
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => removeIssueItem(index)}
                  >
                    REMOVE
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
        {showVoucher && voucherData && (
      <IssueVoucher
        voucherNumber={voucherData.voucherNumber}
        issueDate={voucherData.issueDate}
        designation={voucherData.designation}
        policeStation={voucherData.policeStation}
        district={voucherData.district}
        mobileVehicle={voucherData.mobileVehicle}
        indentNo={voucherData.indentNo}
        indentDate={voucherData.indentDate}
        items={voucherData.items}
        onClose={() => setShowVoucher(false)}
      />
    )}

  </div>
);

}

export default Issue;
