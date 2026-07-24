import { useState, useEffect } from "react";
import Layout from "./components/Layout/Layout";
import OperatorLogin from "./components/OperatorLogin";
import GlobalSearch from "./components/GlobalSearch/GlobalSearch";

import Dashboard from "./pages/Dashboard/Dashboard";
import Inventory from "./pages/Inventory/Inventory";
import Issue from "./pages/Issue/Issue";
import Receive from "./pages/Receive/Receive";
import TemporaryIV from "./pages/TemporaryIV/TemporaryIV";
import PermanentIV from "./pages/PermanentIV/PermanentIV";
import ActivityLog from "./pages/ActivityLog/ActivityLog";
import UserManagement from "./pages/UserManagement/UserManagement";
import Settings from "./pages/Settings/Settings";
import PoliceStationData from "./pages/PoliceStationData/PoliceStationData";
import MobileVehicleData from "./pages/MobileVehicleData/MobileVehicleData";
import FaultyStock from "./pages/FaultyStock/FaultyStock";

function App() {
  const [page, setPage] = useState("dashboard");
  const [operator, setOperator] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const savedOperator = localStorage.getItem("wsms_operator");

    if (savedOperator) {
      setOperator(savedOperator);
    }
  }, []);

  // Handle Ctrl+F and Search button click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "inventory":
        return <Inventory operator={operator} />;

      case "issue":
        return <Issue operator={operator} />;

      case "receive":
        return <Receive operator={operator} />;

      case "temporary":
        return <TemporaryIV />;

      case "police-station-data":
        return <PoliceStationData />;
      case "mobile-vehicle-data":
        return <MobileVehicleData />;

      case "activity":
        return <ActivityLog />;

      case "users":
        return <UserManagement />;

      case "settings":
        return <Settings operator={operator} setOperator={setOperator} />;
      case "permanent":
        return <PermanentIV operator={operator} />;

      case "faulty-stock":
        return <FaultyStock operator={operator} />;
        
      default:
        return <Dashboard />;
    }
  };

  // Handle search result navigation
  const handleSearchNavigate = (result) => {
    switch (result.type) {
      case "INVENTORY_ITEM":
        setPage("inventory");
        // Store the item to highlight in Inventory module
        sessionStorage.setItem("highlight_item", JSON.stringify(result.data));
        break;

      case "VOUCHER":
        if (result.voucherType === "TEMP_IV") {
          setPage("temporary");
          sessionStorage.setItem("highlight_voucher", result.data.voucherNumber);
        } else {
          setPage("permanent");
          sessionStorage.setItem("highlight_voucher", result.data.voucherNumber);
        }
        break;

      case "POLICE_STATION":
        setPage("police-station-data");
        sessionStorage.setItem("highlight_station", result.data.policeStation);
        break;

      case "VEHICLE":
        setPage("mobile-vehicle-data");
        // Store both vehicle and station for navigation
        sessionStorage.setItem("highlight_vehicle", result.data.mobileVehicle);
        if (result.data.policeStation) {
          sessionStorage.setItem("highlight_vehicle_station", result.data.policeStation);
        }
        break;

      case "USER":
        setPage("users");
        sessionStorage.setItem("highlight_user", result.data.username);
        break;

        case "FAULTY_ITEM":
case "CONDEMNED_ITEM":
  setPage("faulty-stock");
  sessionStorage.setItem(
    "highlight_faulty",
    result.data.id
  );
  break;

      default:
        break;
    }
  };

  if (!operator) {
    return <OperatorLogin setOperator={setOperator} />;
  }

  return (
    <>
      <Layout
        currentPage={page}
        setCurrentPage={setPage}
        operator={operator}
        onSearch={() => setIsSearchOpen(true)}
      >
        {renderPage()}
      </Layout>
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleSearchNavigate}
      />
    </>
  );
}

export default App;