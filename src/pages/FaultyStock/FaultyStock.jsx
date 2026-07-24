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

  CONDEMNEDItems,
  setCONDEMNEDItems,

  currentUser,
  addActivity,
} = useStore();


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

  const updatedInventory = inventory.map((inv) => {

    if (
      inv.item === selectedItem &&
      inv.company === selectedCompany &&
      inv.number === selectedGPW
    ) {

      return {
  ...inv,

  status: status,

  history: [
    ...(inv.history || []),
    {
      action:
        status === "FAULTY"
          ? "MARKED FAULTY"
          : "CONDEMNED",

      date: new Date().toLocaleDateString(),

      reason,
    },
  ],
};

    }

    return inv;

  });

setInventory(updatedInventory);

  // ===========================
  // SAVE TO FAULTY / CONDEMNED
  // ===========================

  if (status === "FAULTY") {
  setFaultyItems((prev) => [...prev, record]);

  addActivity({
    module: "FAULTY STOCK",
    action: "MARK FAULTY",
    details: `${selectedItem} ${selectedCompany} ${selectedGPW} MARKED AS FAULTY`,
    user: currentUser,
  });

} else {
  setCONDEMNEDItems((prev) => [...prev, record]);

  addActivity({
    module: "FAULTY STOCK",
    action: "CONDEMNED",
    details: `${selectedItem} ${selectedCompany} ${selectedGPW} MARKED AS CONDEMNED`,
    user: currentUser,
  });
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
    item.id === id
      ? {
          ...item,
          repairStage: "UNDER REPAIR",
        }
      : item
  );

  setFaultyItems(updatedFaulty);

  // Update Inventory History
  const updatedInventory = inventory.map((inv) => {
    if (
      inv.item === repairItem.item &&
      inv.company === repairItem.company &&
      inv.number === repairItem.gpw
    ) {
      return {
        ...inv,
        history: [
          ...(inv.history || []),
          {
            action: "SENT FOR REPAIR",
            date: new Date().toLocaleDateString(),
          },
        ],
      };
    }

    return inv;
  });

setInventory(updatedInventory);
addActivity({
  module: "FAULTY STOCK",
  action: "SEND FOR REPAIR",
  details: `${repairItem.item} ${repairItem.company} ${repairItem.gpw} SENT FOR REPAIR`,
  user: currentUser,
});
};

const handleRepaired = (id) => {
  if (!window.confirm("Mark this item as repaired?")) {
    return;
  }

  const repairedItem = faultyItems.find(
    (item) => item.id === id
  );

  if (!repairedItem) return;

  const updatedFaulty = faultyItems.filter(
    (item) => item.id !== id
  );

  setFaultyItems(updatedFaulty);

  const updatedInventory = inventory.map((inv) => {
    if (
      inv.item === repairedItem.item &&
      inv.company === repairedItem.company &&
      inv.number === repairedItem.gpw
    ) {
      return {
        ...inv,
        status: "AVAILABLE",
        history: [
          ...(inv.history || []),
          {
            action: "REPAIRED",
            date: new Date().toLocaleDateString(),
          },
        ],
      };
    }

    return inv;
  });
setInventory(updatedInventory);
addActivity({
  module: "FAULTY STOCK",
  action: "REPAIRED",
  details: `${repairedItem.item} ${repairedItem.company} ${repairedItem.gpw} REPAIRED AND RETURNED TO STOCK`,
  user: currentUser,
});
};

const handleCONDEMNED = (id) => {
  if (
    !window.confirm(
      "Are you sure you want to CONDEMNED this item?\n\nThis action should only be used for items beyond repair."
    )
  ) {
    return;
  }

  const CONDEMNEDItem = faultyItems.find(
    (item) => item.id === id
  );

  if (!CONDEMNEDItem) return;

  const updatedFaulty = faultyItems.filter(
    (item) => item.id !== id
  );

  setFaultyItems(updatedFaulty);

  setCONDEMNEDItems((prev) => [
    ...prev,
    {
      ...CONDEMNEDItem,
      repairStage: "CONDEMNED",
    },
  ]);


  const updatedInventory = inventory.map((inv) => {
    if (
      inv.item === CONDEMNEDItem.item &&
      inv.company === CONDEMNEDItem.company &&
      inv.number === CONDEMNEDItem.gpw
    ) {
      return {
        ...inv,
        status: "CONDEMNED",
        history: [
          ...(inv.history || []),
          {
            action: "CONDEMNED",
            date: new Date().toLocaleDateString(),
          },
        ],
      };
    }

    return inv;
  });

  setInventory(updatedInventory);
  addActivity({
  module: "FAULTY STOCK",
  action: "CONDEMNED",
  details: `${CONDEMNEDItem.item} ${CONDEMNEDItem.company} ${CONDEMNEDItem.gpw} MARKED AS CONDEMNED`,
  user: currentUser,
});

};

const handleDeleteCONDEMNED = (id) => {

  if (
    !window.confirm(
      "Delete this condemned record?\n\nThis will remove it from the CONDEMNED table only."
    )
  ) {
    return;
  }

  const deletedItem = CONDEMNEDItems.find(
    (item) => item.id === id
  );

  if (!deletedItem) return;

  setCONDEMNEDItems((prev) =>
    prev.filter((item) => item.id !== id)
  );

  addActivity({
    module: "FAULTY STOCK",
    action: "DELETE CONDEMNED",
    details: `${deletedItem.item} ${deletedItem.company} ${deletedItem.gpw} CONDEMNED RECORD DELETED`,
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
                Faulty
            </label>

            <label>
                <input
                    type="radio"
                    checked={status === "CONDEMNED"}
                    onChange={() => setStatus("CONDEMNED")}
                />
                CONDEMNED
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


{/* ================= CONDEMNED ITEMS ================= */}

<div className="faulty-table-card">

  <div className="table-title CONDEMNED-title">
    CONDEMNED ITEMS
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

{(CONDEMNEDItems || []).length === 0 ? (

    <tr>

      <td colSpan="8" className="empty-table">
        NO CONDEMNED ITEMS
      </td>

    </tr>

  ) : (

    CONDEMNEDItems.map((item, index) => (

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

  <td>CONDEMNED</td>

  

  <td>
    <button
      className="delete-btn"
      onClick={() => handleDeleteCONDEMNED(item.id)}
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