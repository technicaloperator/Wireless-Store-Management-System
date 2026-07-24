import { useState } from "react";
import { useStore } from "../../Context/StoreContext";
import "./UserManagement.css";

function UserManagement() {
  const {
    users,
    setUsers,
    currentUser,
    addActivity,
  } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (currentUser !== "ADMIN") {
    return (
      <div className="user-page">
        <h2>User Management</h2>

        <div className="access-denied">
          Only ADMIN can access User Management.
        </div>
      </div>
    );
  }

  const addUser = () => {
    if (!username.trim() || !password.trim()) {
      alert("Enter Username and Password");
      return;
    }

    const exists = users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      alert("Username already exists.");
      return;
    }

    setUsers([
      ...users,
      {
        username,
        password,
        enabled: true,
      },
    ]);

    addActivity({
      module: "USER MANAGEMENT",
      action: "CREATE",
      details: `CREATED USER ${username}`,
      user: currentUser,
    });

    setUsername("");
    setPassword("");

    alert("User Added Successfully");
  };

  const deleteUser = (username) => {
    if (username === "ADMIN") {
      alert("Admin account cannot be deleted.");
      return;
    }

    if (!window.confirm("Delete this user?")) return;

    setUsers(users.filter((u) => u.username !== username));

    addActivity({
      module: "USER MANAGEMENT",
      action: "DELETE",
      details: `DELETED USER ${username}`,
      user: currentUser,
    });
  };

  const toggleUser = (username) => {
    if (username === "ADMIN") {
      alert("Admin account cannot be disabled.");
      return;
    }

    const selectedUser = users.find((u) => u.username === username);

    setUsers(
      users.map((u) =>
        u.username === username
          ? {
              ...u,
              enabled: !u.enabled,
            }
          : u
      )
    );

    addActivity({
      module: "USER MANAGEMENT",
      action: selectedUser?.enabled ? "DISABLE" : "ENABLE",
      details: `${
        selectedUser?.enabled ? "DISABLED" : "ENABLED"
      } USER ${username}`,
      user: currentUser,
    });
  };

  const changePassword = (username) => {
    const newPassword = prompt("Enter New Password");

    if (!newPassword) return;

    setUsers(
      users.map((u) =>
        u.username === username
          ? {
              ...u,
              password: newPassword,
            }
          : u
      )
    );

    addActivity({
      module: "USER MANAGEMENT",
      action: "PASSWORD",
      details: `CHANGED PASSWORD FOR ${username}`,
      user: currentUser,
    });

    alert("Password Changed Successfully");
  };

  return (
    <div className="user-page">
      <h2>User Management</h2>

      <div className="add-user-card">
        <h3>Add New User</h3>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            const value = e.target.value
              .toUpperCase()
              .replace(/[^A-Z ]/g, "");

            setUsername(value);
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="add-user-btn"
          onClick={addUser}
        >
          ADD USER
        </button>
      </div>

      <div className="users-table-card">
        <h3>Registered Users</h3>

        <table className="users-table">
          <thead>
            <tr>
              <th>USERNAME</th>
              <th>PASSWORD</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.username}>
                <td>{user.username}</td>

                <td>{user.password}</td>

                <td>
                  {user.enabled ? "ACTIVE" : "DISABLED"}
                </td>

                <td>
                  <button
                    className="password-btn"
                    onClick={() =>
                      changePassword(user.username)
                    }
                  >
                    CHANGE PASSWORD
                  </button>

                  <button
                    className={
                      user.enabled
                        ? "disable-btn"
                        : "enable-btn"
                    }
                    onClick={() =>
                      toggleUser(user.username)
                    }
                  >
                    {user.enabled
                      ? "DISABLE"
                      : "ENABLE"}
                  </button>

                  {user.username !== "ADMIN" && (
                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteUser(user.username)
                      }
                    >
                      DELETE
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;