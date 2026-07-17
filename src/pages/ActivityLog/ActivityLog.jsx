import { useStore } from "../../Context/StoreContext";
import "./ActivityLog.css";

function ActivityLog() {
  const { activity } = useStore();

  return (
    <div className="activity-page">
      <h2>Activity Log</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>User</th>
            <th>Activity</th>
          </tr>
        </thead>

        <tbody>
          {activity.length > 0 ? (
            activity.map((entry, index) => (
              <tr key={`${entry.date}-${entry.time}-${index}`}>
                <td>{entry.date}</td>
                <td>{entry.time}</td>
                <td>{entry.operator}</td>
                <td>{entry.activity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "30px" }}>
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