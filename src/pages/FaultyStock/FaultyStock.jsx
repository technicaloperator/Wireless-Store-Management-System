import "./FaultyStock.css";
import { useState } from "react";

function FaultyStock() {

  const [status, setStatus] = useState("FAULTY");
  const shortReason = (text) => {
  if (!text) return "-";

  const words = text.trim().split(/\s+/);

  return words.length > 3
    ? words.slice(0, 3).join(" ") + "..."
    : text;
};
  return (
    <div className="faulty-page">

      <div className="faulty-card">

        <h2>FAULTY STOCK</h2>

        <div className="faulty-form">

          <div className="form-group">
            <label>ITEM</label>
            <select>
              <option>SELECT ITEM</option>
            </select>
          </div>

          <div className="form-group">
            <label>COMPANY</label>
            <select>
              <option>SELECT COMPANY</option>
            </select>
          </div>

          <div className="form-group">
            <label>GPW / SERIAL NO.</label>
            <select>
              <option>SELECT NUMBER</option>
            </select>
          </div>

          <div className="form-group">
            <label>REASON (OPTIONAL)</label>
            <textarea />
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
                    checked={status === "CONDEMN"}
                    onChange={() => setStatus("CONDEMN")}
                />
                Condemned
            </label>

        </div>

    </div>

    <button className="add-btn">
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

  <tr>

    <td colSpan="8" className="empty-table">
      NO FAULTY ITEMS
    </td>

  </tr>

</tbody>

  </table>

</div>


{/* ================= CONDEMNED ITEMS ================= */}

<div className="faulty-table-card">

  <div className="table-title condemn-title">
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

  <tr>

    <td colSpan="8" className="empty-table">
      NO CONDEMNED ITEMS
    </td>

  </tr>

</tbody>

  </table>

</div>

    </div>
  );

}

export default FaultyStock;