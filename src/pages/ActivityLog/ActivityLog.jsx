import { useMemo } from "react";
import { useStore } from "../../Context/StoreContext";
import "./ActivityLog.css";

function ActivityLog() {
  const { activity = [] } = useStore();

  const displayUser = (entry) => entry.user || entry.operator || "-";
  const displayDetails = (entry) => entry.details || entry.activity || "-";

  const rows = useMemo(() => {
    return (activity || []).map((entry, index) => ({
      key: entry.id || index,
      date: entry.date,
      time: entry.time,
      user: displayUser(entry),
      module: entry.module || "-",
      action: entry.action || "-",
      details: displayDetails(entry),
    }));
  }, [activity]);

  return (
    <div className="activity-page">
      <h2>Activity Log</h2>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "110px" }}>Date</th>
            <th style={{ width: "90px" }}>Time</th>
            <th style={{ width: "120px" }}>User</th>
            <th style={{ width: "150px" }}>Module</th>
            <th style={{ width: "150px" }}>Action</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((r) => (
              <tr key={r.key}>
                <td>{r.date}</td>
                <td>{r.time}</td>
                <td>{r.user}</td>
                <td>{r.module}</td>
                <td>{r.action}</td>
                <td>{r.details}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "30px",
                }}
              >
                No activity records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityLog;