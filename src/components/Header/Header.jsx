import "./Header.css";

function Header() {

  const today = new Date().toLocaleDateString();

  return (
    <div className="header">

      <div className="title">
        <h2>Wireless Department Morbi</h2>
        <p>Wireless Store Management System</p>
      </div>

      <div className="right">
        <span>{today}</span>

        <div className="user">
          Operator : Nirav
        </div>

        <button className="logout">
          Logout
        </button>
      </div>

    </div>
  );
}

export default Header;