import { useState, useEffect } from "react";

function BulkAddModal({
  items,
  newItem,
  setNewItem,
  bulkAdd,
  onClose,
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const selectedItem = items.find(
    (x) => x.name === newItem.item
  );

  useEffect(() => {
    if (
      selectedItem &&
      selectedItem.companies.length > 0 &&
      !newItem.company
    ) {
      setNewItem({
        ...newItem,
        company: selectedItem.companies[0],
      });
    }
  }, [newItem.item]);

  return (
    <div className="modal">

      <div className="modal-box">

        <h2>BULK ADD INVENTORY</h2>

        <label>ITEM</label>

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

        <label>COMPANY</label>

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

          {(selectedItem?.companies || []).map(
            (company) => (
              <option
                key={company}
                value={company}
              >
                {company}
              </option>
            )
          )}
        </select>

        <label>
          {selectedItem?.numberType}
        </label>

        <div className="bulk-range">

          <input
            type="number"
            placeholder="FROM"
            value={from}
            onChange={(e) =>
              setFrom(e.target.value)
            }
          />

          <span>TO</span>

          <input
            type="number"
            placeholder="TO"
            value={to}
            onChange={(e) =>
              setTo(e.target.value)
            }
          />

        </div>

        <div className="modal-buttons">

          <button
            className="save-btn"
            onClick={() => {
              if (
                !newItem.company ||
                !from ||
                !to
              ) {
                alert(
                  "PLEASE FILL ALL FIELDS"
                );
                return;
              }

              bulkAdd(from, to);
            }}
          >
            ADD ITEMS
          </button>

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            CANCEL
          </button>

        </div>

      </div>

    </div>
  );
}

export default BulkAddModal;