import { useState, useMemo, useEffect } from "react";
import "./Inventory.css";
import BulkAddModal from "./components/BulkAddModal";

import { useStore } from "../../Context/StoreContext";
import { items } from "../../data/masterData";

function Inventory() {
  const {
    inventory,
    setInventory,
    issueVouchers,
    currentUser,
    activity,
    setActivity,
  } = useStore();
  const DELETE_CODE = "12345";

  const [highlightedItemId, setHighlightedItemId] = useState(null);

  // Handle search navigation highlighting
  useEffect(() => {
    const highlightData = sessionStorage.getItem("highlight_item");
    if (highlightData) {
      const item = JSON.parse(highlightData);
      setSelectedItem(item.item);
      setSelectedCompany(item.company);
      setSelectedStatus("ALL");
      setHighlightedItemId(item.id);
      
      // Scroll to the item after a short delay
      setTimeout(() => {
        const element = document.querySelector(`[data-item-id="${item.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Remove highlight after 2 seconds
          setTimeout(() => setHighlightedItemId(null), 2000);
        }
      }, 100);

      sessionStorage.removeItem("highlight_item");
    }
  }, []);

  const deleteInventoryItem = (id) => {
    const inputCode = window.prompt(
      "ENTER DELETE CODE TO REMOVE THIS ITEM FROM INVENTORY:"
    );

    if (inputCode === null) return;

    if (inputCode !== DELETE_CODE) {
      window.alert("INCORRECT CODE. ITEM NOT DELETED.");
      return;
    }

    if (!window.confirm("CONFIRM PERMANENT DELETE?")) return;

    const deletedItem = inventory.find((item) => item.id === id);

    if (deletedItem) {
      setActivity((prev) => [
        {
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          operator: currentUser,
          activity: `DELETED ${deletedItem.item} ${deletedItem.company} ${deletedItem.number}`,
        },
        ...prev,
      ]);
    }

    setInventory(inventory.filter((item) => item.id !== id));
  };

  const [selectedItem, setSelectedItem] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [openItems, setOpenItems] = useState({});
  const [openCompanies, setOpenCompanies] = useState({});

  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [historyData, setHistoryData] = useState({
  item: "",
  company: "",
  number: "",
  status: "",
  history: [],
});

  const [newItem, setNewItem] = useState({
    item: "",
    company: "",
    number: "",
  });

  const currentItem = useMemo(() => {
    return items.find((x) => x.name === selectedItem);
  }, [selectedItem]);

  const companies = currentItem?.companies || [];

  const statusOrder = {
  AVAILABLE: 1,
  ISSUED: 2,
  FAULTY: 3,
  CONDEMNED: 4, // or CONDEMN if you're still using that
};

const filteredInventory = inventory
  .filter((x) => {
    const searchValue = search.toUpperCase();
    const companyMatch =
      !selectedCompany || x.company === selectedCompany;
    const statusMatch =
      selectedStatus === "ALL" || x.status === selectedStatus;

    return (
      x.item === selectedItem &&
      companyMatch &&
      statusMatch &&
      x.number.toString().includes(searchValue)
    );
  })
  .sort((a, b) => {
    const statusDiff =
      (statusOrder[a.status] || 99) -
      (statusOrder[b.status] || 99);

    if (statusDiff !== 0) return statusDiff;

    return Number(a.number) - Number(b.number);
  });

  const getCount = (item, company, status) => {
    return inventory.filter(
      (x) =>
        x.item === item &&
        x.company === company &&
        x.status === status
    ).length;
  };

  const getItemCount = (item) => {
    return inventory.filter((x) => x.item === item).length;
  };

  const getCompanyCount = (item, company) => {
    return inventory.filter(
      (x) => x.item === item && x.company === company
    ).length;
  };

  const toggleItem = (item) => {
    setOpenItems({
      ...openItems,
      [item]: !openItems[item],
    });
  };

  const toggleCompany = (company) => {
    setOpenCompanies({
      ...openCompanies,
      [company]: !openCompanies[company],
    });
  };

  const openFolder = (
    item,
    company = "",
    status = "ALL"
  ) => {
    setSelectedItem(item);
    setSelectedCompany(company);
    setSelectedStatus(status);
  };

  const isVoucherIssuedItem = (item) => {
    const itemNumber = String(item.number).trim();

    return issueVouchers.some((voucher) =>
      (voucher.items || []).some((entry) => {
        if (entry.isExtra) return false;
        return (
          entry.item === item.item &&
          entry.company === item.company &&
          entry.gpwNumbers &&
          entry.gpwNumbers.split(",").some((part) => {
            const trimmed = part.trim();
            if (trimmed.includes("-")) {
              const [from, to] = trimmed.split("-").map(Number);
              const num = Number(itemNumber);
              return num >= from && num <= to;
            }
            return trimmed === itemNumber;
          })
        );
      })
    );
  };

  const deleteItem = (id) => 
    {
    if (!window.confirm("DELETE THIS ITEM ?")) return;

    setInventory(inventory.filter((x) => x.id !== id));
  };
const updateStatus = (
  id,
  newStatus,
  policeStation = "",
  voucher = ""
) => {
  const existingItem = inventory.find((item) => item.id === id);

  const updated = inventory.map((item) => {
    if (item.id !== id) return item;

    const previousStatus = item.status;
    const action =
      newStatus === "AVAILABLE" && previousStatus === "ISSUED"
        ? "RECEIVED"
        : newStatus;

    return {
      ...item,
      status: newStatus,
      history: [
        ...(item.history || []),
        {
          date: new Date().toLocaleDateString(),
          action,
          policeStation,
          voucher,
        },
      ],
    };
  });

  setInventory(updated);

  if (existingItem && existingItem.status === "ISSUED" && newStatus === "AVAILABLE") {
    setActivity((prev) => [
      {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        operator: currentUser,
        activity: `RECEIVED ${existingItem.item} ${existingItem.number}`,
      },
      ...prev,
    ]);
  }
};
  const addSingleItem = () => {
    if (!newItem.company || !newItem.number) return;
    // Check duplicate Item + Company + Number
const duplicate = inventory.some(
  (item) =>
    item.item.toLowerCase() === newItem.item.toLowerCase() &&
    item.company.toLowerCase() === newItem.company.toLowerCase() &&
    item.number.toString().trim() === newItem.number.toString().trim()
);

if (duplicate) {
  alert(
    `${newItem.item}\n${newItem.company}\n\nNumber ${newItem.number} already exists.`
  );
  return;
}

    const itemInfo = items.find(
      (x) => x.name === newItem.item
    );

    const obj = {
  id: Date.now(),
  item: newItem.item,
  company: newItem.company,
  number: newItem.number,
  numberType: itemInfo.numberType,

  status: "AVAILABLE",
  location: "WIRELESS STORE",

  // Faulty Stock
  faultReason: "",
  repairStatus: "",
  faultyDate: "",
  repairSentDate: "",
  repairedDate: "",
  condemnedDate: "",

  history: [
    {
      action: "ITEM ADDED",
      date: new Date().toLocaleDateString(),
    },
  ],
};

    setInventory([...inventory, obj]);

    setActivity((prev) => [
      {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        operator: currentUser,
        activity: `ADDED ${newItem.item} ${newItem.company} ${newItem.number}`,
      },
      ...prev,
    ]);

    setShowAdd(false);

    setNewItem({
      item: "",
      company: "",
      number: "",
    });
  };

  const bulkAdd = (from, to) => {
    if (from > to) return;
    // Check for duplicate numbers before adding
for (let i = Number(from); i <= Number(to); i++) {
  const duplicate = inventory.some(
    (item) =>
      item.item.toLowerCase() === newItem.item.toLowerCase() &&
      item.company.toLowerCase() === newItem.company.toLowerCase() &&
      item.number.toString().trim() === i.toString()
  );

  if (duplicate) {
    alert(
      `${newItem.item}\n${newItem.company}\n\nNumber ${i} already exists.\n\nBulk Add Cancelled.`
    );
    return;
  }
}

    const itemInfo = items.find(
      (x) => x.name === newItem.item
    );

    let arr = [...inventory];

    for (let i = Number(from); i <= Number(to); i++) {
      arr.push({
  id: Date.now() + i,

  item: newItem.item,

  company: newItem.company,

  number: i.toString(),

  numberType: itemInfo.numberType,

  status: "AVAILABLE",

  location: "WIRELESS STORE",

  // Faulty Stock
  faultReason: "",
  repairStatus: "",
  faultyDate: "",
  repairSentDate: "",
  repairedDate: "",
  condemnedDate: "",

  history: [
    {
      action: "ITEM ADDED",
      date: new Date().toLocaleDateString(),
    },
  ],
});
    }

    setInventory(arr);

    setActivity((prev) => [
      {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        operator: currentUser,
        activity: `ADDED ${to - from + 1} ${newItem.item} ITEMS (${from}-${to})`,
      },
      ...prev,
    ]);

    setShowBulk(false);
  };

  const openHistory = (item) => {

  const sortedHistory = [...(item.history || [])].sort((a, b) => {

    return new Date(a.date) - new Date(b.date);

  });

  setHistoryData({

    number: item.number,

    item: item.item,

    company: item.company,

    status: item.status,

    history: sortedHistory,

  });

  setShowHistory(true);

};

  const statusList = [
    "AVAILABLE",
    "ISSUED",
    "FAULTY",
    "CONDEMN",
  ];
    return (
    <div className="inventory-page">

      {/* ================= LEFT PANEL ================= */}

      <div className="inventory-sidebar">

        <h2>INVENTORY</h2>

        {items.map((item) => (

          <div key={item.name} className="tree-item">

            <div
              className="tree-title"
              onClick={() => {
                toggleItem(item.name);
                openFolder(item.name);
              }}
            >
              {openItems[item.name] ? "▼" : "▶"}{" "}
              {item.name}
              <span className="count">
                ({getItemCount(item.name)})
              </span>
            </div>

            {openItems[item.name] &&
              item.companies.map((company) => (

                <div
                  key={company}
                  className="company-block"
                >

                  <div
  className="company-title"
  onClick={() => {
    toggleCompany(item.name + company);

    openFolder(
      item.name,
      company,
      "ALL"
    );
  }}
>
                    {openCompanies[item.name + company]
                      ? "▼"
                      : "▶"}{" "}
                    {company}
                    <span className="count">
                      ({getCompanyCount(item.name, company)})
                    </span>
                  </div>

                  {openCompanies[item.name + company] && (

                    <div className="status-list">

                      {statusList.map((status) => (

                        <div
                          key={status}
                          className={`status-folder ${
                            selectedItem === item.name &&
                            selectedCompany === company &&
                            selectedStatus === status
                              ? "active-folder"
                              : ""
                          }`}
                          onClick={() =>
                            openFolder(
                              item.name,
                              company,
                              status
                            )
                          }
                        >
                          {status}

                          <span className="count">

                            (
                            {getCount(
                              item.name,
                              company,
                              status
                            )}
                            )

                          </span>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              ))}

          </div>

        ))}

      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div className="inventory-content">

        <div className="inventory-topbar">

          <h2>

            {selectedItem ? (
              <>
                {selectedItem}
                {selectedCompany && ` / ${selectedCompany}`}
                {" / "}
                {selectedStatus}
              </>
            ) : (
              "SELECT AN ITEM TO VIEW INVENTORY"
            )}

          </h2>

          <div className="top-actions">

            <input
              type="text"
              placeholder="SEARCH GPW / SERIAL..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value.toUpperCase())
              }
            />

            <button
  className="add-btn"
  onClick={() => {
    setNewItem({
      item: items[0].name,
      company: "",
      number: "",
    });

    setShowAdd(true);
  }}
>
  + ADD ITEM
</button>

            <button
  className="bulk-btn"
  onClick={() => {
    setNewItem({
      item: items[0].name,
      company: "",
      number: "",
    });

    setShowBulk(true);
  }}
>
              + BULK ADD
            </button>

          </div>

        </div>

        <table className="inventory-table">

          <thead>

            <tr>

              <th>No.</th>

              <th>
                {currentItem?.numberType || "NUMBER"}
              </th>

              <th>STATUS</th>

              <th>HISTORY</th>

              <th>ACTION</th>

            </tr>

          </thead>

          <tbody>

            {!selectedItem ? (

              <tr>

                <td colSpan="5" className="no-data">

                  SELECT AN ITEM FROM THE LEFT SIDEBAR TO VIEW INVENTORY

                </td>

              </tr>

            ) : filteredInventory.length === 0 ? (

              <tr>

                <td colSpan="5" className="no-data">

                  NO RECORD FOUND

                </td>

              </tr>

            ) : (

              filteredInventory.map((row, index) => (

                <tr key={row.id} data-item-id={row.id} className={highlightedItemId === row.id ? "highlight-row" : ""}>

                  <td>{index + 1}</td>

                  <td>{row.number}</td>

                  <td>{row.status}</td>

                  <td>

                    <button
                      className="history-btn"
                      onClick={() =>
                        openHistory(row)
                      }
                    >
                      TRACK HISTORY
                    </button>

                  </td>

                  <td>
                    <div className="action-buttons">
                      {row.status === "ISSUED" ? (
                        <button
                          className="delete-btn"
                          onClick={() => updateStatus(row.id, "AVAILABLE")}
                          disabled={isVoucherIssuedItem(row)}
                          title={
                            isVoucherIssuedItem(row)
                              ? "This item is issued through a voucher in reports; receive it there."
                              : "Receive item into inventory"
                          }
                        >
                          RECEIVE
                        </button>
                      ) : (
                        <span className="action-placeholder">-</span>
                      )}

                      <button
                        className="delete-item-btn"
                        onClick={() => deleteInventoryItem(row.id)}
                      >
                        DELETE
                      </button>
                    </div>
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>
       
                {/* ================= ADD ITEM MODAL ================= */}

        {showAdd && (

          <div className="modal">

            <div className="modal-box">

              <h2>ADD INVENTORY ITEM</h2>

              <select
                value={newItem.item}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    item: e.target.value,
                    company: "",
                  })
                }
              >

                {items.map((item) => (

                  <option
                    key={item.id}
                    value={item.name}
                  >
                    {item.name}
                  </option>

                ))}

              </select>

              <select
                value={newItem.company}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    company: e.target.value,
                  })
                }
              >

                <option value="">
                  SELECT COMPANY
                </option>

                {(items.find(
                  (x) => x.name === newItem.item
                )?.companies || []).map((company) => (

                  <option
                    key={company}
                    value={company}
                  >
                    {company}
                  </option>

                ))}

              </select>

              <input
                type="text"
                placeholder={
                  items.find(
                    (x) => x.name === newItem.item
                  )?.numberType
                }
                value={newItem.number}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    number: e.target.value,
                  })
                }
              />

              <div className="modal-buttons">

                <button
                  className="save-btn"
                  onClick={addSingleItem}
                >
                  SAVE
                </button>

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowAdd(false)
                  }
                >
                  CANCEL
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================= BULK ADD MODAL ================= */}

        {showBulk && (

          <BulkAddModal
            newItem={newItem}
            setNewItem={setNewItem}
            items={items}
            bulkAdd={bulkAdd}
            onClose={() =>
              setShowBulk(false)
            }
          />

        )}

        {/* ================= HISTORY ================= */}

        {showHistory && (

<div className="modal">

<div className="history-box">

<h2>TRACK HISTORY</h2>

<div className="history-header">

<p><b>ITEM :</b> {historyData.item}</p>

<p><b>COMPANY :</b> {historyData.company}</p>

<p>

<b>

{historyData.item === "BATTERY" ||
historyData.item === "SMPS"

? "SERIAL NO."

: "GPW NO."}

</b>

{" "}

{historyData.number}

</p>

<p>

<b>STATUS :</b>

{historyData.status}

</p>

</div>

<table>

<thead>

<tr>

<th>DATE</th>

<th>ACTION</th>

<th>POLICE STATION</th>

<th>VOUCHER</th>

</tr>

</thead>

<tbody>

{historyData.history.length === 0 ? (

<tr>

<td colSpan="4">

NO HISTORY AVAILABLE

</td>

</tr>

) : (

historyData.history.map((row,index)=>(

<tr key={index}>

<td>{row.date}</td>

<td>{row.action}</td>

<td>{row.policeStation || "-"}</td>

<td>{row.voucher || "-"}</td>

</tr>

))

)}

</tbody>

</table>

<button

className="close-btn"

onClick={()=>setShowHistory(false)}

>

CLOSE

</button>

</div>

</div>

)}

      </div>

    </div>

  );

}

export default Inventory;