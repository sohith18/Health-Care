import { useState, useEffect, useContext } from 'react';
import styles from '../Styles/ProfileDropDown.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { TranslationContext } from '../store/TranslationContext';

// Function to fetch user data
async function getUserData(AuthToken, setData, setIsFetching) {
    if (AuthToken) {
        try {
            setIsFetching(true);
            const response = await fetch("http://localhost:3000/user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AuthToken}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setData({ ...data.user, password: '' });
                console.log(data);
            } else {
                console.log(data);
                setData(null);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setData(null);
        } finally {
            setIsFetching(false);
        }
    }
}

export default function ProfileDropdown({ handleDisplalog_out_name }) {
    const [isActive, setIsActive] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [userData, setUserData] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { translatedTexts } = useContext(TranslationContext);

    // Check if the current path matches any of the dropdown link paths
    useEffect(() => {
        if (['/profile-change', '/settings', '/profile-doctor-change'].includes(location.pathname)) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [location]);

    // Fetch user data on mount
    useEffect(() => {
        const AuthToken = localStorage.getItem("AuthToken");
        if (AuthToken) {
            getUserData(AuthToken, setUserData, setIsFetching);
        }
    }, []);

    const toggleDropdown = () => {
        setIsActive((prev) => !prev);
    };

    // Determine the profile link based on user role
    const profileLink =
        userData?.role === 'DOCTOR' ? '/profile-change-doctor' : '/profile-change';

    return (
        <div className={styles.dropdown}>
            <button
                className={`${styles.dropbtn} ${isActive ? styles.active : ''}`}
                onClick={toggleDropdown}
            >
                {translatedTexts['Profile'] || 'Profile'}{' '}
                <span className={`${styles.arrow} ${isActive ? styles.active : ''}`}></span>
            </button>
            {isActive && (
                <div className={`${styles.dropbox} ${isActive ? styles.show : ''}`}>
                    <div className={styles.dropitem}>
                        {!isFetching && userData ? (
                            <Link to={profileLink} className={styles.linkButton}>
                                {translatedTexts['Profile Settings'] || 'Profile Settings'}
                            </Link>
                        ) : (
                            <p>Loading...</p>
                        )}
                        <Link
                            className={styles.linkButton}
                            to="/"
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
