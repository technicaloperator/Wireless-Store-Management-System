import { useState, useEffect } from "react";

function PoliceStationMaster() {
  const [stations, setStations] = useState([]);
  const [newStation, setNewStation] = useState("");

  useEffect(() => {
    const savedStations = localStorage.getItem("wsms_stations");

    if (savedStations) {
      setStations(JSON.parse(savedStations));
    } else {
      const defaultStations = [
        { id: 1, name: "A Division Police Station" },
        { id: 2, name: "B Division Police Station" },
        { id: 3, name: "Halvad Police Station" },
        { id: 4, name: "Tankara Police Station" },
        { id: 5, name: "Wankaner Police Station" },
        { id: 6, name: "Maliya Police Station" },
        { id: 7, name: "LCB Morbi" },
        { id: 8, name: "SOG Morbi" },
        { id: 9, name: "Traffic Branch Morbi" },
        { id: 10, name: "Wireless Department Morbi" },
        { id: 11, name: "Wireless Workshop Rajkot" },
        { id: 12, name: "CHECKPOST - CHHATTAR" },
        { id: 13, name: "CHECKPOST - KAVADIYA" },
        { id: 14, name: "CHECKPOST - MALIYA" },
        { id: 15, name: "CHECKPOST - AANDARNA" },
        { id: 16, name: "CHECKPOST - AAMARAN" },
        { id: 17, name: "CHECKPOST - SHANALA" },
        { id: 18, name: "CHECKPOST - MAHENDRANAGAR" },
        { id: 19, name: "CHECKPOST - DALADI" },
        { id: 20, name: "CHECKPOST - KANKOT" },
        { id: 21, name: "CHECKPOST - MESARIYA" }
      ];

      setStations(defaultStations);
      localStorage.setItem(
        "wsms_stations",
        JSON.stringify(defaultStations)
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "wsms_stations",
      JSON.stringify(stations)
    );
  }, [stations]);

  const addStation = () => {
    if (!newStation.trim()) {
      alert("Enter Police Station Name");
      return;
    }

    const exists = stations.find(
      (x) =>
        x.name.toLowerCase() ===
        newStation.toLowerCase()
    );

    if (exists) {
      alert("Police Station already exists");
      return;
    }

    const station = {
      id: Date.now(),
      name: newStation,
    };

    setStations([...stations, station]);
    setNewStation("");
  };

  const deleteStation = (id) => {
    if (window.confirm("Delete this station?")) {
      setStations(
        stations.filter((x) => x.id !== id)
      );
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>Police Station Master</h2>

        <div className="inventory-actions">
          <input
            type="text"
            placeholder="Police Station Name"
            value={newStation}
            onChange={(e) =>
              setNewStation(e.target.value)
            }
          />

          <button
            className="add-btn"
            onClick={addStation}
          >
            Add Station
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Police Station / Office Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {stations.map((station) => (
            <tr key={station.id}>
              <td>{station.id}</td>

              <td>{station.name}</td>

              <td>
                <button
                  className="export-btn"
                  onClick={() =>
                    deleteStation(station.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {stations.length === 0 && (
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign: "center",
                  padding: "30px",
                }}
              >
                No Police Stations Added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PoliceStationMaster;