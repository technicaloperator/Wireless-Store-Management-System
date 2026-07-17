import { useState, useEffect } from "react";

function CompanyMaster() {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("wsms_companies");

    if (saved) {
      setCompanies(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "wsms_companies",
      JSON.stringify(companies)
    );
  }, [companies]);

  const addCompany = () => {
    if (!newCompany.trim()) return;

    if (
      companies.find(
        (x) =>
          x.name.toLowerCase() ===
          newCompany.toLowerCase()
      )
    ) {
      alert("Company already exists");
      return;
    }

    setCompanies([
      ...companies,
      {
        id: Date.now(),
        name: newCompany,
      },
    ]);

    setNewCompany("");
  };

  const deleteCompany = (id) => {
    if (window.confirm("Delete this company?")) {
      setCompanies(
        companies.filter((x) => x.id !== id)
      );
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>Company Master</h2>

        <div className="inventory-actions">
          <input
            placeholder="Company Name"
            value={newCompany}
            onChange={(e) =>
              setNewCompany(e.target.value)
            }
          />

          <button
            className="add-btn"
            onClick={addCompany}
          >
            Add Company
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Company Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((x) => (
            <tr key={x.id}>
              <td>{x.id}</td>

              <td>{x.name}</td>

              <td>
                <button
                  className="export-btn"
                  onClick={() =>
                    deleteCompany(x.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {companies.length === 0 && (
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                No Companies Added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CompanyMaster;