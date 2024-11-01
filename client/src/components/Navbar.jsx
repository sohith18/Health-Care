import { useState, useEffect } from 'react';
import {Link } from 'react-router-dom';
import classes from '../Styles/Navbar.module.css';
import ProfileDropdown from './ProfileDropDown';
import { useRef } from 'react';

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
 

  useEffect(() => {
    if (user) {
      setdisplalog_out_name(user.first_name); 
    }
  }, [user]);

  useEffect(() => {
    const AuthToken = localStorage.getItem('AuthToken');
    fetchUserData(AuthToken, setUser);
  }, []);


  return (
    <nav className={classes.outer}>
      <div className={classes.bar}>
        <Link className={classes.insidebar} to ="/">Home</Link>
        <Link className={classes.insidebar} to="/medicines">Medicines</Link>
        <Link className={classes.insidebar} to="/">Video Call</Link>

        {displalog_out_name ? 
          <ProfileDropdown handleDisplalog_out_name={setdisplalog_out_name}/>  :<Link className={classes.insidebar}  to ="/login">Login</Link>}

      </div>
    </nav>
  );
}
