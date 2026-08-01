import { useState } from "react";
import { useStore } from "../Context/StoreContext";
import logo from "../assets/logo.png";
import "./OperatorLogin.css";

function OperatorLogin({ setOperator }) {
const {
  users,
  setCurrentUser,
  addActivity,
} = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    

    const user = users.find(
      (u) =>
        u.username === username
    );
    

    if (!user) {
      alert("Invalid Username");
      return;
    }

    if (!user.enabled) {
      alert("This user is disabled.");
      return;
    }

    if (user.password !== password) {
      alert("Wrong Password");
      return;
    }

    localStorage.setItem(
      "wsms_operator",
      user.username
    );

    setOperator(user.username);

    setCurrentUser(user.username);

    addActivity({
  module: "LOGIN",
  action: "LOGIN",
  details: "USER LOGGED INTO WSMS",
  user: user.username,
});
  };
  return (
  <div className="login-page">
  <div className="login-card">

    <img
      src={logo}
      alt="Gujarat Police"
      className="login-logo"
    />

    <h1 className="login-title">
  WIRELESS STORE MANAGEMENT SYSTEM
</h1>

<div className="title-line"></div>

<p className="login-subtitle">
  Wireless Department - Morbi
</p>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(
            e.target.value
              .toUpperCase()
              .replace(/[^A-Z ]/g, "")
          )
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
        className="login-input"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
        className="login-input"
      />

      <button
        className="login-button"
        onClick={handleLogin}
      >
        LOGIN
      </button>

      <div className="login-footer">
  <strong>Version 1.4</strong>
  <br />
  Developed by - Nirav N. Loriya
  <br />
  Technical Operator - Morbi
</div>

    </div>

  </div>
);
}
export default OperatorLogin;