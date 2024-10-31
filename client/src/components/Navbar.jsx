import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const fetchUserData = async (AuthToken, setUser) => {
  if (AuthToken) {
    try {
      const response = await fetch("http://localhost:3000/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AuthToken}`
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        console.log(data);
      } else {
        console.log(data);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    }
  }
};

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const AuthToken = localStorage.getItem('AuthToken');
    fetchUserData(AuthToken, setUser);
  }, []);

  const [displalog_out_name, setdisplalog_out_name] = useState(user);
  useEffect(() => {
    setdisplalog_out_name(user && user.first_name);
  }, [user]);

  let loggedin = displalog_out_name ? true : false;
  let val = loggedin ? "/video-call" : "/login";

  let login_details, log_out;

  if (!displalog_out_name) {
    login_details = <Link className="a-css" to="/login">Login</Link>;
  } else {
    login_details = <div className="a-css">{displalog_out_name}</div>;
    log_out = (
      <button
        className="nav-button"
        style={{ fontSize: 13 }}
        onClick={() => {
          localStorage.removeItem("AuthToken");
          setdisplalog_out_name(null);
          window.location.assign(`/`);
        }}
      >
        Log Out
      </button>
    );
  }

  return (
    <nav className="nav-outer">
      <div className="nav-bar">
        <Link className="a-css" to="/">Home</Link>
        <Link className="a-css" to="/medicines">Medicines</Link>
        <Link className="a-css" to={val}>Video Call</Link>
        {login_details}
        {log_out}
      </div>
    </nav>
  );
}
