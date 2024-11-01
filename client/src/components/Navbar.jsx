import { useState, useEffect } from 'react';
import {Link } from 'react-router-dom';
import classes from '../Styles/Navbar.module.css';

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
  const [displalog_out_name, setdisplalog_out_name] = useState(null);
  let login_details;
  let log_out;
  useEffect(() => {
    const AuthToken = localStorage.getItem('AuthToken');
    fetchUserData(AuthToken, setUser);
  }, []);

  if(!displalog_out_name){
    login_details =  <Link to ="/login">Login</Link>
  }
  else{
    login_details = 
      <div className="a-css">
          {displalog_out_name}
      </div>
    log_out = 
    <button className='nav-button' style={{fontSize:13}}  onClick={()=>{setdisplalog_out_name(window.localStorage.removeItem("user"))
    window.location.assign(`/`)}}>Log Out
    </button>   
  }

  return (
    <nav className={classes.outer}>
      <div className={classes.bar}>
        <Link to ="/">Home</Link>
        <Link to="/medicines">Medicines</Link>
        <Link to="/">Video Call</Link>
        {/* <Link className="a-css" to="/chatbot">Chatbot</Link> */}
        {login_details}
        {log_out}
      </div>
    </nav>
  );
}
