import { useState, useEffect, useContext } from 'react';
import styles from '../Styles/ProfileDropDown.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { TranslationContext } from '../store/TranslationContext';

export default function ProfileDropdown({ handleDisplalog_out_name }) {
    const [isActive, setIsActive] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const {translatedTexts} = useContext(TranslationContext)

    // Check if the current path matches any of the dropdown link paths
    useEffect(() => {
        if (['/profile-change', '/settings'].includes(location.pathname)) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [location]);

    const toggleDropdown = () => {
        setIsActive((prev) => !prev);
    };

    return (
        <div className={styles.dropdown}>
            <button
                className={`${styles.dropbtn} ${isActive ? styles.active : ''}`}
                onClick={toggleDropdown}
            >
                {translatedTexts['Profile'] || 'Profile'} <span className={`${styles.arrow} ${isActive ? styles.active:''}`}></span>
            </button>
            {isActive && (
                <div className={`${styles.dropbox} ${isActive ? styles.show : ''}`}>
                    <div className={styles.dropitem}>
                        <Link to='/profile-change' className={styles.linkButton}>{translatedTexts['Profile Settings'] || 'Profile Settings'}</Link>
                        <Link
                            className={styles.linkButton}
                            to='/'
                            onClick={() => {
                                handleDisplalog_out_name();
                                window.localStorage.removeItem("AuthToken");
                                navigate('/');
                                window.location.reload();
                            }}
                        >
                            {translatedTexts['Logout'] || 'Logout'}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
