import { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import styles from '../Styles/DoctorBoxes.module.css';
import { TranslationContext } from '../store/TranslationContext';

export default function DoctorBoxes() {
    const { translatedTexts } = useContext(TranslationContext);
    const navigate = useNavigate(); // Initialize the navigation hook

    const specialties = [
        translatedTexts['Eye Specialist'] || 'Eye Specialist',
        translatedTexts['Cardiologist'] || 'Cardiologist',
        translatedTexts['Dermatologist'] || 'Dermatologist',
        translatedTexts['Pediatrician'] || 'Pediatrician',
        translatedTexts['Orthopedic Surgeon'] || 'Orthopedic Surgeon',
        translatedTexts['Psychiatrist'] || 'Psychiatrist',
    ];

    // Handle navigation with the selected specialty
    const handleNavigation = (specialty) => {
        // Navigate to doctor-search page with the selected specialty in the URL
        navigate(`/doctor-search?specialization=${encodeURIComponent(specialty)}`);
    };

    return (
        <div>
            <h2 className={styles.heading}>{translatedTexts['Core Services'] || 'Core Services'}</h2>
            <div className={styles.doctorContainer}>
                {specialties.map((specialty, index) => (
                    <div key={index} className={styles.doctorBox}>
                        <div className={styles.doctorBoxInner}>
                            <div className={styles.doctorBoxFront}>
                                {specialty}
                            </div>
                            <div className={styles.doctorBoxBack}>
                                <p>{`More about ${specialty}`}</p>
                                <button
                                    className={styles.navigateButton}
                                    onClick={() => handleNavigation(specialty)} // Pass specialty to navigation
                                >
                                    {translatedTexts['Doctor Search'] || 'Doctor Search'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
