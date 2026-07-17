import { useState, useRef } from "react";
import { useStore } from "../../Context/StoreContext";
import "./Settings.css";

function Settings() {
  const {
    inventory,
    setInventory,
    issues,
    setIssues,
    receives,
    setReceives,
    activity,
    setActivity,
    issueVouchers,
    setIssueVouchers,
    permanentVouchers,
    setPermanentVouchers,
  } = useStore();

  const fileInputRef = useRef(null);

  const [message, setMessage] = useState("");

  const [backupInfo, setBackupInfo] = useState(null);

  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const [restoreData, setRestoreData] = useState(null);

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearOptions, setClearOptions] = useState({
    inventory: false,
    issues: false,
    receives: false,
    activity: false,
    issueVouchers: false,
  });

  // ==========================================
  // BACKUP
  // ==========================================

  const handleBackup = () => {
    const now = new Date();

    const backup = {
      application: "WSMS",
      version: "1.0",

      backupDate: now.toLocaleString(),

      inventory,
      issues,
      receives,
      activity,
      issueVouchers,
      permanentVouchers,
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    const fileName =
      `WSMS_BACKUP_${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, "0")}-` +
      `${String(now.getDate()).padStart(2, "0")}_` +
      `${String(now.getHours()).padStart(2, "0")}-` +
      `${String(now.getMinutes()).padStart(2, "0")}.wsms`;

    a.download = fileName;

    a.click();

    URL.revokeObjectURL(url);

    localStorage.setItem(
      "wsms_last_backup",
      now.toLocaleString()
    );

    setBackupInfo(now.toLocaleString());

    setMessage("BACKUP CREATED SUCCESSFULLY.");
  };

  // ==========================================
  // SELECT RESTORE FILE
  // ==========================================

  const selectRestoreFile = () => {
    fileInputRef.current.click();
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        setRestoreData(data);

        setShowRestoreDialog(true);

      } catch {

        alert("INVALID BACKUP FILE.");

      }
    };

    reader.readAsText(file);
  };
    // ==========================================
  // RESTORE BACKUP
  // ==========================================

  const confirmRestore = () => {
    if (!restoreData) return;

    setInventory(restoreData.inventory || []);
    setIssues(restoreData.issues || []);
    setReceives(restoreData.receives || []);
    setActivity(restoreData.activity || []);
    setIssueVouchers(restoreData.issueVouchers || []);
    setPermanentVouchers(restoreData.permanentVouchers || []);

    setShowRestoreDialog(false);
    setRestoreData(null);

    setMessage("BACKUP RESTORED SUCCESSFULLY.");
  };

  // ==========================================
  // CLEAR SELECTIVE DATA
  // ==========================================

  const openClearDialog = () => {
    setClearOptions({
      inventory: false,
      issues: false,
      receives: false,
      activity: false,
      issueVouchers: false,
    });
    setShowClearDialog(true);
  };

  const toggleClearOption = (key) => {
    setClearOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const confirmClearData = () => {
    const selectedKeys = Object.keys(clearOptions).filter(
      (key) => clearOptions[key]
    );

    if (selectedKeys.length === 0) {
      alert("Please select at least one data type to clear.");
      return;
    }

    const ok = window.confirm(
      `WARNING!\n\nThis will permanently delete the selected data:\n${selectedKeys
        .map((key) => `- ${key.toUpperCase()}`)
        .join("\n")}\n\nDo you want to continue?`
    );

    if (!ok) return;

    if (clearOptions.inventory) setInventory([]);
    if (clearOptions.issues) setIssues([]);
    if (clearOptions.receives) setReceives([]);
    if (clearOptions.activity) setActivity([]);
    if (clearOptions.issueVouchers) setIssueVouchers([]);
    if (clearOptions.permanentVouchers) setPermanentVouchers([]);

    setShowClearDialog(false);
    setMessage("SELECTED DATA HAS BEEN CLEARED.");
  };

  return (
    <div className="settings-page">

      <h2>SETTINGS</h2>

      {/* ================= SOFTWARE INFO ================= */}

      <table className="settings-table">
        <tbody>

          <tr>
            <td>DEPARTMENT</td>
            <td>WIRELESS DEPARTMENT MORBI</td>
          </tr>

          <tr>
            <td>VERSION</td>
            <td>WSMS v1.0</td>
          </tr>

          <tr>
            <td>STORAGE</td>
            <td>BROWSER LOCAL STORAGE</td>
          </tr>

          <tr>
            <td>LAST BACKUP</td>
            <td>
              {backupInfo ||
                localStorage.getItem("wsms_last_backup") ||
                "NEVER"}
            </td>
          </tr>

        </tbody>
      </table>

      {/* ================= DATA MANAGEMENT ================= */}

      <div className="data-management">

        <h3>DATA MANAGEMENT</h3>

        <button
          className="backup-btn"
          onClick={handleBackup}
        >
          💾 BACKUP COMPLETE DATA
        </button>

        <button
          className="restore-btn"
          onClick={selectRestoreFile}
        >
          📂 RESTORE BACKUP
        </button>

        <button
          className="clear-btn"
          onClick={openClearDialog}
        >
          🗑 CLEAR DATA
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".wsms,.json"
          onChange={handleRestoreFile}
        />

        {message && (
          <div className="status-box">
            {message}
          </div>
        )}

        {showClearDialog && (
          <div className="clear-overlay">
            <div className="clear-dialog">
              <h2>CLEAR DATA</h2>
              <p>Select the data types you want to clear:</p>
              <div className="clear-options">
                <label>
                  <input
                    type="checkbox"
                    checked={clearOptions.inventory}
                    onChange={() => toggleClearOption("inventory")}
                  />
                  Inventory
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={clearOptions.issues}
                    onChange={() => toggleClearOption("issues")}
                  />
                  Issue Records
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={clearOptions.receives}
                    onChange={() => toggleClearOption("receives")}
                  />
                  Receive Records
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={clearOptions.activity}
                    onChange={() => toggleClearOption("activity")}
                  />
                  Activity Logs
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={clearOptions.issueVouchers}
                    onChange={() => toggleClearOption("issueVouchers")}
                  />
                  Stored Issue Vouchers
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={clearOptions.permanentVouchers}
                    onChange={() => toggleClearOption("permanentVouchers")}
                  />
                  Stored Permanent IVs
                </label>
              </div>
              <div className="clear-buttons">
                <button
                  className="yes-btn"
                  onClick={confirmClearData}
                >
                  CLEAR SELECTED
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowClearDialog(false)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= RESTORE PREVIEW ================= */}

      {showRestoreDialog && restoreData && (

        <div className="restore-overlay">

          <div className="restore-dialog">

            <h2>RESTORE BACKUP</h2>

            <table>

              <tbody>

                <tr>
                  <td>BACKUP DATE</td>
                  <td>{restoreData.backupDate}</td>
                </tr>

                <tr>
                  <td>INVENTORY</td>
                  <td>{restoreData.inventory?.length || 0}</td>
                </tr>

                <tr>
                  <td>ISSUES</td>
                  <td>{restoreData.issues?.length || 0}</td>
                </tr>

                <tr>
                  <td>RECEIVES</td>
                  <td>{restoreData.receives?.length || 0}</td>
                </tr>

                <tr>
                  <td>ACTIVITY</td>
                  <td>{restoreData.activity?.length || 0}</td>
                </tr>

                <tr>
                  <td>VOUCHERS</td>
                  <td>{restoreData.issueVouchers?.length || 0}</td>
                </tr>

              </tbody>

            </table>

            <div className="restore-buttons">

              <button
                className="yes-btn"
                onClick={confirmRestore}
              >
                RESTORE
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setShowRestoreDialog(false);
                  setRestoreData(null);
                }}
              >
                CANCEL
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Settings;