import { useState } from "react";
import { useStore } from "../Context/StoreContext";
import logo from "../assets/logo.png";
import "./OperatorLogin.css";

function OperatorLogin({ setOperator }) {

  const {
    users,
    setCurrentUser,
    activity,
    setActivity,
  } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Users:", users);
console.log("Username entered:", username);
console.log("Password entered:", password);

    const user = users.find(
      (u) =>
        u.username === username
    );
    console.log("Found user:", user);

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

    setActivity([
      {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        operator: user.username,
        activity: "LOGIN",
      },
      ...activity,
    ]);
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
  <strong>Version 1.0</strong>
  <br />
  Wireless Department - Morbi
  <br />
  Gujarat Police
</div>

    </div>

  </div>
);
}
export default OperatorLogin;