import "./FaultyStock.css";
import { useState, useEffect } from "react";
import { useStore } from "../../Context/StoreContext";

function FaultyStock() {

  // ===========================
  // FORM STATES
  // ===========================

  const [status, setStatus] = useState("FAULTY");
  const [highlightId, setHighlightId] = useState(null);



  const [selectedItem, setSelectedItem] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedGPW, setSelectedGPW] = useState("");
  const [reason, setReason] = useState("");
  const store = useStore();




const {
  inventory,
  setInventory,

  faultyItems,
  setFaultyItems,

  UNSERVICEABLEItems,
  setUNSERVICEABLEItems,

  currentUser,
  addActivity,
} = useStore();

  // Helpers
  const logActivity = (module, action, details) =>
    addActivity({ module, action, details, user: currentUser });

  const pushInventoryHistoryByMatch = (inventoryArr, matchFn, updates = {}, historyEntry = {}) =>
    inventoryArr.map((inv) =>
      matchFn(inv)
        ? {
            ...inv,
            ...updates,
            history: [...(inv.history || []), historyEntry],
          }
        : inv
    );


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

useEffect(() => {
  const id = sessionStorage.getItem("highlight_faulty");

  if (!id) return;

  setHighlightId(id);

  setTimeout(() => {
    const row = document.getElementById(`faulty-${id}`);

    if (row) {
      row.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, 200);

  setTimeout(() => {
    setHighlightId(null);
    sessionStorage.removeItem("highlight_faulty");
  }, 3000);
}, []);

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
  const updatedInventory = pushInventoryHistoryByMatch(
    inventory,
    (inv) =>
      inv.item === selectedItem &&
      inv.company === selectedCompany &&
      inv.number === selectedGPW,
    { status: status },
    {
      action: status === "FAULTY" ? "MARKED FAULTY" : "UNSERVICEABLE",
      date: new Date().toLocaleDateString(),
      reason,
    }
  );

  setInventory(updatedInventory);

  // ===========================
  // SAVE TO FAULTY / UNSERVICEABLE
  // ===========================

  if (status === "FAULTY") {
    setFaultyItems((prev) => [...prev, record]);
    logActivity(
      "FAULTY STOCK",
      "MARK FAULTY",
      `${selectedItem} ${selectedCompany} ${selectedGPW} MARKED AS FAULTY`
    );
  } else {
    setUNSERVICEABLEItems((prev) => [...prev, record]);
    logActivity(
      "FAULTY STOCK",
      "UNSERVICEABLE",
      `${selectedItem} ${selectedCompany} ${selectedGPW} MARKED AS UNSERVICEABLE`
    );
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

  const repairItem = faultyItems.find((item) => item.id === id);

  if (!repairItem) return;

  // Update Faulty Table
  const updatedFaulty = faultyItems.map((item) =>
    item.id === id ? { ...item, repairStage: "UNDER REPAIR" } : item
  );

  setFaultyItems(updatedFaulty);

  // Update Inventory History
  const invUpdated = pushInventoryHistoryByMatch(
    inventory,
    (inv) =>
      inv.item === repairItem.item &&
      inv.company === repairItem.company &&
      inv.number === repairItem.gpw,
    {},
    { action: "SENT FOR REPAIR", date: new Date().toLocaleDateString() }
  );

  setInventory(invUpdated);
  logActivity(
    "FAULTY STOCK",
    "SEND FOR REPAIR",
    `${repairItem.item} ${repairItem.company} ${repairItem.gpw} SENT FOR REPAIR`
  );
};

const handleRepaired = (id) => {
  if (!window.confirm("Mark this item as repaired?")) {
    return;
  }

  const repairedItem = faultyItems.find(
    (item) => item.id === id
  );

  if (!repairedItem) return;

  const updatedFaulty = faultyItems.filter((item) => item.id !== id);
  setFaultyItems(updatedFaulty);

  const invUpdated = pushInventoryHistoryByMatch(
    inventory,
    (inv) =>
      inv.item === repairedItem.item &&
      inv.company === repairedItem.company &&
      inv.number === repairedItem.gpw,
    { status: "AVAILABLE" },
    { action: "REPAIRED", date: new Date().toLocaleDateString() }
  );
  setInventory(invUpdated);
  logActivity(
    "FAULTY STOCK",
    "REPAIRED",
    `${repairedItem.item} ${repairedItem.company} ${repairedItem.gpw} REPAIRED AND RETURNED TO STOCK`
  );
};

const handleUNSERVICEABLE = (id) => {
  if (
    !window.confirm(
      "Are you sure you want to UNSERVICEABLE this item?\n\nThis action should only be used for items beyond repair."
    )
  ) {
    return;
  }

  const UNSERVICEABLEItem = faultyItems.find(
    (item) => item.id === id
  );

  if (!UNSERVICEABLEItem) return;

  const updatedFaulty = faultyItems.filter((item) => item.id !== id);
  setFaultyItems(updatedFaulty);

  setUNSERVICEABLEItems((prev) => [
    ...prev,
    {
      ...UNSERVICEABLEItem,
      repairStage: "UNSERVICEABLE",
    },
  ]);

  const invUpdated = pushInventoryHistoryByMatch(
    inventory,
    (inv) =>
      inv.item === UNSERVICEABLEItem.item &&
      inv.company === UNSERVICEABLEItem.company &&
      inv.number === UNSERVICEABLEItem.gpw,
    { status: "UNSERVICEABLE" },
    { action: "UNSERVICEABLE", date: new Date().toLocaleDateString() }
  );

  setInventory(invUpdated);
  logActivity(
    "FAULTY STOCK",
    "UNSERVICEABLE",
    `${UNSERVICEABLEItem.item} ${UNSERVICEABLEItem.company} ${UNSERVICEABLEItem.gpw} MARKED AS UNSERVICEABLE`
  );

};

const handleDeleteUNSERVICEABLE = (id) => {

  if (
    !window.confirm(
      "Delete this UNSERVICEABLE record?\n\nThis will remove it from the UNSERVICEABLE table only."
    )
  ) {
    return;
  }

  const deletedItem = UNSERVICEABLEItems.find(
    (item) => item.id === id
  );

  if (!deletedItem) return;

  setUNSERVICEABLEItems((prev) =>
    prev.filter((item) => item.id !== id)
  );

  addActivity({
    module: "FAULTY STOCK",
    action: "DELETE UNSERVICEABLE",
    details: `${deletedItem.item} ${deletedItem.company} ${deletedItem.gpw} UNSERVICEABLE RECORD DELETED`,
    user: currentUser,
  });

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
                FAULTY
            </label>

            <label>
                <input
                    type="radio"
                    checked={status === "UNSERVICEABLE"}
                    onChange={() => setStatus("UNSERVICEABLE")}
                />
                UNSERVICEABLE
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

        <th>GPW / Serial No.</th>

        <th>Reason</th>

        <th>Date</th>

        <th>Status</th>

        <th>Action</th>

      </tr>

    </thead>

   <tbody>

{(faultyItems || []).length === 0 ? (

    <tr>

      <td colSpan="8" className="empty-table">
        NO FAULTY ITEMS
      </td>

    </tr>

  ) : (

    faultyItems.map((item, index) => (

      <tr
  key={item.id}
  id={`faulty-${item.id}`}
  className={String(highlightId) === String(item.id) ? "highlight-row" : ""}
>

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
  className="UNSERVICEABLE-btn"
  disabled={item.repairStage !== "UNDER REPAIR"}
  onClick={() => handleUNSERVICEABLE(item.id)}
>
  UNSERVICEABLE
</button>

          </div>

        </td>

      </tr>

    ))

  )}

</tbody>

  </table>

</div>


{/* ================= UNSERVICEABLE ITEMS ================= */}

<div className="faulty-table-card">

  <div className="table-title UNSERVICEABLE-title">
    UNSERVICEABLE ITEMS
  </div>

  <table className="faulty-table">

   <thead>
  <tr>
    <th>No.</th>
    <th>Item</th>
    <th>Company</th>
    <th>GPW / Serial No.</th>
    <th>Reason</th>
    <th>Date</th>
    <th>Status</th>
    <th>Action</th>
  </tr>
</thead>

    <tbody>

{(UNSERVICEABLEItems || []).length === 0 ? (

    <tr>

      <td colSpan="8" className="empty-table">
        NO UNSERVICEABLE ITEMS
      </td>

    </tr>

  ) : (

    UNSERVICEABLEItems.map((item, index) => (

      <tr
  key={item.id}
  id={`faulty-${item.id}`}
  className={String(highlightId) === String(item.id) ? "highlight-row" : ""}
>

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

  <td>UNSERVICEABLE</td>

  

  <td>
    <button
      className="delete-btn"
      onClick={() => handleDeleteUNSERVICEABLE(item.id)}
    >
      DELETE
    </button>
  </td>

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