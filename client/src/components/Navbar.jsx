import { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom'; 
import classes from '../Styles/Navbar.module.css';
import ProfileDropdown from './ProfileDropDown';
import LanguageDropdown from './LanguageDropDown';
import { TranslationContext } from '../store/TranslationContext'; 
import {allSentences} from '../locales/text.js'; 
import photo1 from '../assets/logo.png';

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
  const {translatedTexts,handleLanguageChange} = useContext(TranslationContext);


  const [user, setUser] = useState(null);
  const [displalog_out_name, setdisplalog_out_name] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setdisplalog_out_name(user.name);
    }
  }, [user]);

  useEffect(() => {
    const AuthToken = localStorage.getItem('AuthToken');
    fetchUserData(AuthToken, setUser);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLangChange = (languageCode) => {
    handleLanguageChange(languageCode, allSentences);
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
            <img
              src={photo1} // Replace with your logo path
              alt="Company Logo"
              className={classes.logo}
            />
          </NavLink>
          <NavLink 
            className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
            to="/prescription-history"
            onClick={toggleMenu}
          >
            {translatedTexts['Prescritions'] || 'Prescriptions'}
          </NavLink>
          <NavLink 
            className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
            to="/video-call"
            onClick={toggleMenu}
          >
            {translatedTexts['Video Call'] || 'Video Call'}
          </NavLink>

          <LanguageDropdown onLanguageChange={handleLangChange}/>

          {displalog_out_name ? (
            <ProfileDropdown handleDisplalog_out_name={setdisplalog_out_name} />
          ) : (
            <NavLink 
              className={({ isActive }) => isActive ? `${classes.insidebar} ${classes.activeLink}` : classes.insidebar} 
              to="/login"
            >
              {translatedTexts['Login'] || 'Login'}
            </NavLink>
          )}
           
        </div>
      </div>
    </nav>
  );
}
