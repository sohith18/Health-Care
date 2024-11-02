import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink instead of Link
import classes from '../Styles/Navbar.module.css';
import ProfileDropdown from './ProfileDropDown';

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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setdisplalog_out_name(user.first_name);
    }
  }, [user]);

  useEffect(() => {
    const AuthToken = localStorage.getItem('AuthToken');
    fetchUserData(AuthToken, setUser);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={classes.outer}>
      <div className={classes.bar}>
        <div className={`${classes.hamburger} ${menuOpen ? classes.active : ''}`} onClick={toggleMenu}>
          <div className={classes.bar1}></div>
          <div className={classes.bar2}></div>
          <div className={classes.bar3}></div>
        </div>
        <div className={`${classes.menu} ${menuOpen ? classes.show : ''}`}>
          <NavLink 
            className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
            to="/" 
            onClick={toggleMenu}
          >
            Home
          </NavLink>
          <NavLink 
            className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
            to="/medicines"
            onClick={toggleMenu}
          >
            Medicines
          </NavLink>
          <NavLink 
            className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
            to="/video-call"
            onClick={toggleMenu}
          >
            Video Call
          </NavLink>
          {displalog_out_name ? (
            <ProfileDropdown handleDisplalog_out_name={setdisplalog_out_name} />
          ) : (
            <NavLink 
              className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
              to="/login"
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}


// import { useState, useEffect } from 'react';
// import { NavLink } from 'react-router-dom'; // Use NavLink instead of Link
// import classes from '../Styles/Navbar.module.css';
// import ProfileDropdown from './ProfileDropDown';

// const fetchUserData = async (AuthToken, setUser) => {
//   if (AuthToken) {
//     try {
//       const response = await fetch("http://localhost:3000/user", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${AuthToken}`
//         },
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setUser(data.user);
//         console.log(data);
//       } else {
//         console.log(data);
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       setUser(null);
//     }
//   }
// };

// export default function Navbar() {
//   const [user, setUser] = useState(null);
//   const [displalog_out_name, setdisplalog_out_name] = useState(null);
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setdisplalog_out_name(user.first_name);
//     }
//   }, [user]);

//   useEffect(() => {
//     const AuthToken = localStorage.getItem('AuthToken');
//     fetchUserData(AuthToken, setUser);
//   }, []);

//   const toggleMenu = () => {
//     setMenuOpen(!menuOpen);
//   };

//   return (
//     <nav className={classes.outer}>
//       <div className={classes.bar}>
//         <div className={classes.hamburger} onClick={toggleMenu}>
//           <div className={classes.bar1}></div>
//           <div className={classes.bar2}></div>
//           <div className={classes.bar3}></div>
//         </div>
//         <div className={`${classes.menu} ${menuOpen ? classes.show : ''}`}>
//           <NavLink 
//             className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
//             to="/" 
//           >
//             Home
//           </NavLink>
//           <NavLink 
//             className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
//             to="/medicines"
//           >
//             Medicines
//           </NavLink>
//           <NavLink 
//             className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
//             to="/video-call"
//           >
//             Video Call
//           </NavLink>
//           {displalog_out_name ? (
//             <ProfileDropdown handleDisplalog_out_name={setdisplalog_out_name} />
//           ) : (
//             <NavLink 
//               className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
//               to="/login"
//             >
//               Login
//             </NavLink>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }
