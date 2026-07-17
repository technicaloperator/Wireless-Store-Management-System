import { useState, useEffect } from "react";

function ItemMaster() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("wsms_items");

    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "wsms_items",
      JSON.stringify(items)
    );
  }, [items]);

  const addItem = () => {
    if (!newItem.trim()) return;

    if (
      items.find(
        (x) =>
          x.name.toLowerCase() ===
          newItem.toLowerCase()
      )
    ) {
      alert("Item already exists");
      return;
    }

    setItems([
      ...items,
      {
        id: Date.now(),
        name: newItem,
      },
    ]);

    setNewItem("");
  };

  const deleteItem = (id) => {
    if (
      window.confirm(
        "Delete this item?"
      )
    ) {
      setItems(
        items.filter(
          (x) => x.id !== id
        )
      );
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>Item Master</h2>

        <div className="inventory-actions">
          <input
            placeholder="Item Name"
            value={newItem}
            onChange={(e) =>
              setNewItem(
                e.target.value
              )
            }
          />

          <button
            className="add-btn"
            onClick={addItem}
          >
            Add Item
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {items.map((x) => (
            <tr key={x.id}>
              <td>{x.id}</td>

              <td>{x.name}</td>

              <td>
                <button
                  className="export-btn"
                  onClick={() =>
                    deleteItem(
                      x.id
                    )
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign:
                    "center",
                  padding:
                    "40px",
                }}
              >
                No Items Added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ItemMaster;