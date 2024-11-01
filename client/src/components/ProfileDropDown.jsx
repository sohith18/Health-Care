import { useState,useEffect } from 'react';
import styles from '../Styles/ProfileDropDown.module.css';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function ProfileDropdown({handleDisplalog_out_name}) {

    const [isActive, setIsActive] = useState(false);
    const location = useLocation();

    // Check if the current path matches any of the dropdown link paths
    useEffect(() => {
        if (['/profile-change', '/settings'].includes(location.pathname)) {
            console.log('hi')
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [location]);

    return (
        <div className={styles.dropdown}>
            <button className={`${styles.dropbtn} ${isActive ? styles.active : ''}`}>
                Profile
            </button>
            <div className={styles.dropbox}>
                <div className={styles.dropitem}>
                    <Link to='/profile-change' className={styles.linkButton}>Profile Settings</Link>
                    <Link className={styles.linkButton}  to='/' onClick={()=>{handleDisplalog_out_name(window.localStorage.removeItem("AuthToken"))}}>Logout</Link>
                </div>

            </div>
        </div>
    );
}
