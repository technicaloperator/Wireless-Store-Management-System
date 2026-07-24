import { useStore } from "../../Context/StoreContext";
import "./ActivityLog.css";

function ActivityLog() {
  const { activity = [] } = useStore();

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
          {activity.length > 0 ? (
            activity.map((entry, index) => (
              <tr key={entry.id || index}>
                <td>{entry.date}</td>

                <td>{entry.time}</td>

                <td>{entry.user || entry.operator || "-"}</td>

                <td>{entry.module || "-"}</td>

                <td>{entry.action || "-"}</td>

                <td>{entry.details || entry.activity || "-"}</td>
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