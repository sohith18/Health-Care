import styles from '../Styles/ProfileDropDown.module.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function ProfileDropdown({handleDisplalog_out_name}) {

    return (
        <div className={styles.dropdown}>
            <button className={styles.dropbtn}>
                Profile
            </button>
            <div className={styles.dropbox}>
                <div className={styles.dropitem}>
                    <Link to='/profile-change' className={styles.linkButton}>Change Profile</Link>
                    <Link to='/settings' className={styles.linkButton}>Settings</Link>
                    <Link className={styles.linkButton}  to='/' onClick={()=>{handleDisplalog_out_name(window.localStorage.removeItem("AuthToken"))}}>Logout</Link>
                </div>

            </div>
        </div>
    );
}
