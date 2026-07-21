import "./FaultyStock.css";
import { useState, useEffect } from "react";

function FaultyStock() {

  // ===========================
  // FORM STATES
  // ===========================

  const [status, setStatus] = useState("FAULTY");

  const [inventory, setInventory] = useState([]);

  const [selectedItem, setSelectedItem] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedGPW, setSelectedGPW] = useState("");
  const [reason, setReason] = useState("");
  const [faultyItems, setFaultyItems] = useState([]);
  const [CONDEMNEDedItems, setCONDEMNEDedItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
// ===========================
// LOAD INVENTORY
// ===========================

useEffect(() => {
  const storedInventory =
    JSON.parse(localStorage.getItem("wsms_inventory")) || [];

  setInventory(storedInventory);
}, []);

// ===========================
// LOAD FAULTY / CONDEMNEDED
// ===========================

useEffect(() => {
  const storedFaulty =
    JSON.parse(localStorage.getItem("wsms_faultyStock")) || [];

  const storedCONDEMNEDed =
    JSON.parse(localStorage.getItem("wsms_CONDEMNEDedStock")) || [];

  setFaultyItems(storedFaulty);
  setCONDEMNEDedItems(storedCONDEMNEDed);

  setDataLoaded(true);
}, []);

// ===========================
// SAVE FAULTY
// ===========================

useEffect(() => {
  if (!dataLoaded) return;

  localStorage.setItem(
    "wsms_faultyStock",
    JSON.stringify(faultyItems)
  );
}, [faultyItems, dataLoaded]);

// ===========================
// SAVE CONDEMNEDED
// ===========================

useEffect(() => {
  if (!dataLoaded) return;

  localStorage.setItem(
    "wsms_CONDEMNEDedStock",
    JSON.stringify(CONDEMNEDedItems)
  );
}, [CONDEMNEDedItems, dataLoaded]);

  // ===========================
  // DROPDOWN DATA
  // ===========================

  const itemList = [
  ...new Set(
    inventory
      .filter((inv) => inv.status === "AVAILABLE")
      .map((inv) => inv.item)
  ),
];

  const companyList = [
  ...new Set(
    inventory
      .filter(
        (inv) =>
          inv.item === selectedItem &&
          inv.status === "AVAILABLE"
      )
      .map((inv) => inv.company)
  ),
];

 const numberList = inventory
  .filter(
    (inv) =>
      inv.item === selectedItem &&
      inv.company === selectedCompany &&
      inv.status === "AVAILABLE"
  )
  .map((inv) => inv.number);
  // ===========================
  // SHORT REASON
  // ===========================

  const shortReason = (text) => {

    if (!text) return "-";

    const words = text.trim().split(/\s+/);

    return words.length > 3
      ? words.slice(0, 3).join(" ") + "..."
      : text;
  };

 const handleAddToStock = () => {

  if (!selectedItem || !selectedCompany || !selectedGPW) {
    alert("Please complete all fields.");
    return;
  }

  const record = {
    id: Date.now(),
    item: selectedItem,
    company: selectedCompany,
    gpw: selectedGPW,
    reason,
    date: new Date().toLocaleDateString("en-GB"),
    repairStage: "PENDING",
  };

  // ===========================
  // UPDATE INVENTORY STATUS
  // ===========================

  const updatedInventory = inventory.map((inv) => {

    if (
      inv.item === selectedItem &&
      inv.company === selectedCompany &&
      inv.number === selectedGPW
    ) {

      return {
        ...inv,
        status: status === "FAULTY"
          ? "FAULTY"
          : "CONDEMNEDED",
      };

    }

    return inv;

  });

  setInventory(updatedInventory);

  localStorage.setItem(
    "wsms_inventory",
    JSON.stringify(updatedInventory)
  );

  // ===========================
  // SAVE TO FAULTY / CONDEMNEDED
  // ===========================

  if (status === "FAULTY") {
    setFaultyItems((prev) => [...prev, record]);
  } else {
    setCONDEMNEDedItems((prev) => [...prev, record]);
  }

  // ===========================
  // RESET FORM
  // ===========================

  setSelectedItem("");
  setSelectedCompany("");
  setSelectedGPW("");
  setReason("");

};
const handleSendForRepair = (id) => {
if (!window.confirm("Send this item for repair?")) {
  return;
}
  const updated = faultyItems.map((item) =>

    item.id === id
      ? {
          ...item,
          repairStage: "UNDER REPAIR",
        }
      : item

  );

  setFaultyItems(updated);

};
const handleRepaired = (id) => {
if (!window.confirm("Mark this item as repaired?")) {
  return;
}
  // Find repaired item
  const repairedItem = faultyItems.find(
    (item) => item.id === id
  );

  if (!repairedItem) return;

  // Remove from Faulty table
  const updatedFaulty = faultyItems.filter(
    (item) => item.id !== id
  );

  setFaultyItems(updatedFaulty);

  // Update Inventory
  const updatedInventory = inventory.map((inv) => {

    if (
      inv.item === repairedItem.item &&
      inv.company === repairedItem.company &&
      inv.number === repairedItem.gpw
    ) {

      return {
        ...inv,
        status: "AVAILABLE",
      };

    }

    return inv;

  });

  setInventory(updatedInventory);

  localStorage.setItem(
    "wsms_inventory",
    JSON.stringify(updatedInventory)
  );

};
const handleCONDEMNED = (id) => {
if (
  !window.confirm(
    "Are you sure you want to CONDEMNED this item?\n\nThis action should only be used for items beyond repair."
  )
) {
  return;
}
  // Find CONDEMNEDed item
  const CONDEMNEDedItem = faultyItems.find(
    (item) => item.id === id
  );

  if (!CONDEMNEDedItem) return;

  // Remove from Faulty table
  const updatedFaulty = faultyItems.filter(
    (item) => item.id !== id
  );

  setFaultyItems(updatedFaulty);

  // Add to CONDEMNEDed table
  setCONDEMNEDedItems((prev) => [
    ...prev,
    {
      ...CONDEMNEDedItem,
      repairStage: "CONDEMNED",
    },
  ]);

  // Update Inventory
  const updatedInventory = inventory.map((inv) => {

    if (
      inv.item === CONDEMNEDedItem.item &&
      inv.company === CONDEMNEDedItem.company &&
      inv.number === CONDEMNEDedItem.gpw
    ) {

      return {
        ...inv,
        status: "CONDEMNED",
      };

    }

    return inv;

  });

  setInventory(updatedInventory);

  localStorage.setItem(
    "wsms_inventory",
    JSON.stringify(updatedInventory)
  );

};
  return (
    <div className="faulty-page">

      <div className="faulty-card">

        <h2>FAULTY STOCK</h2>

        <div className="faulty-form">

          <div className="form-group">
            <label>ITEM</label>
            <select
  value={selectedItem}
  onChange={(e) => {
    setSelectedItem(e.target.value);
    setSelectedCompany("");
    setSelectedGPW("");
  }}
>
  <option value="">SELECT ITEM</option>

  {itemList.map((item) => (
    <option key={item} value={item}>
      {item}
    </option>
  ))}
</select>
          </div>

          <div className="form-group">
            <label>COMPANY</label>
            <select
  value={selectedCompany}
  onChange={(e) => {
    setSelectedCompany(e.target.value);
    setSelectedGPW("");
  }}
  disabled={!selectedItem}
>
  <option value="">SELECT COMPANY</option>

  {companyList.map((company) => (
    <option key={company} value={company}>
      {company}
    </option>
  ))}
</select>
          </div>

          <div className="form-group">
            <label>GPW / SERIAL NO.</label>
            <select
  value={selectedGPW}
  onChange={(e) => setSelectedGPW(e.target.value)}
  disabled={!selectedCompany}
>
  <option value="">SELECT NUMBER</option>

  {numberList.map((number) => (
    <option key={number} value={number}>
      {number}
    </option>
  ))}
</select>
          </div>

          <div className="form-group">
            <label>REASON (OPTIONAL)</label>
           <textarea
  value={reason}
  onChange={(e) => setReason(e.target.value)}
/>
          </div>

          <div className="status-row">

    <div className="status-left">

      <label className="status-title">STATUS</label>

        <div className="radio-group">

            <label>
                <input
                    type="radio"
                    checked={status === "FAULTY"}
                    onChange={() => setStatus("FAULTY")}
                />
                Faulty
            </label>

            <label>
                <input
                    type="radio"
                    checked={status === "CONDEMNED"}
                    onChange={() => setStatus("CONDEMNED")}
                />
                CONDEMNEDed
            </label>

        </div>

    </div>

    <button
  className="add-btn"
  onClick={handleAddToStock}
>
        ADD TO STOCK
    </button>

</div>

        </div>

      </div>
{/* ================= FAULTY ITEMS ================= */}

<div className="faulty-table-card">

  <div className="table-title">
    FAULTY ITEMS
  </div>

  <table className="faulty-table">

    <thead>

      <tr>

        <th>No.</th>

        <th>Item</th>

        <th>Company</th>

        <th>GPW / Serial</th>

        <th>Reason</th>

        <th>Date</th>

        <th>Status</th>

        <th>Action</th>

      </tr>

    </thead>

   <tbody>

  {faultyItems.length === 0 ? (

    <tr>

      <td colSpan="8" className="empty-table">
        NO FAULTY ITEMS
      </td>

    </tr>

  ) : (

    faultyItems.map((item, index) => (

      <tr key={item.id}>

        <td>{index + 1}</td>

        <td>{item.item}</td>

        <td>{item.company}</td>

        <td>{item.gpw}</td>

        <td
          className="reason-cell"
          title={item.reason}
        >
          {shortReason(item.reason)}
        </td>

        <td>{item.date}</td>

        <td>{item.repairStage}</td>

        <td>

          <div className="action-buttons">

            <button
  className="send-btn"
  disabled={item.repairStage !== "PENDING"}
  onClick={() => handleSendForRepair(item.id)}
>
  SEND FOR REPAIR
</button>

            <button
  className="repair-btn"
  disabled={item.repairStage !== "UNDER REPAIR"}
  onClick={() => handleRepaired(item.id)}
>
  REPAIRED
</button>

            <button
  className="CONDEMNED-btn"
  disabled={item.repairStage !== "UNDER REPAIR"}
  onClick={() => handleCONDEMNED(item.id)}
>
  CONDEMNED
</button>

          </div>

        </td>

      </tr>

    ))

  )}

</tbody>

  </table>

</div>


{/* ================= CONDEMNEDED ITEMS ================= */}

<div className="faulty-table-card">

  <div className="table-title CONDEMNED-title">
    CONDEMNEDED ITEMS
  </div>

  <table className="faulty-table">

    <thead>
  <tr>
    <th>No.</th>
    <th>Item</th>
    <th>Company</th>
    <th>GPW / Serial</th>
    <th>Reason</th>
    <th>Date</th>
    <th>Status</th>
    <th>Action</th>
  </tr>
</thead>

    <tbody>

  {CONDEMNEDedItems.length === 0 ? (

    <tr>

      <td colSpan="8" className="empty-table">
        NO CONDEMNEDED ITEMS
      </td>

    </tr>

  ) : (

    CONDEMNEDedItems.map((item, index) => (

      <tr key={item.id}>

        <td>{index + 1}</td>

        <td>{item.item}</td>

        <td>{item.company}</td>

        <td>{item.gpw}</td>

        <td
          className="reason-cell"
          title={item.reason}
        >
          {shortReason(item.reason)}
        </td>

        <td>{item.date}</td>

        <td>CONDEMNEDED</td>

        <td>-</td>

      </tr>

    ))

  )}

</tbody>

  </table>

</div>

    </div>
  );

}

export default FaultyStock;