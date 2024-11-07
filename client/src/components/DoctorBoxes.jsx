import { useContext } from 'react';
import styles from '../Styles/DoctorBoxes.module.css'; 
import { TranslationContext } from '../store/TranslationContext'; 

export default function DoctorBoxes() {
    const { translatedTexts } = useContext(TranslationContext);

    const specialties = [
        translatedTexts['Eye Specialist'] || 'Eye Specialist',
        translatedTexts['Cardiologist'] || 'Cardiologist',
        translatedTexts['Dermatologist'] || 'Dermatologist',
        translatedTexts['Pediatrician'] || 'Pediatrician',
        translatedTexts['Orthopedic Surgeon'] || 'Orthopedic Surgeon',
        translatedTexts['Psychiatrist'] || 'Psychiatrist',
    ];

    const handleClick = (specialty) => {
        alert(translatedTexts['You clicked on'] + ` ${specialty}` || `You clicked on ${specialty}`); // Replace with your desired action
    };

    return (
        <div>
            <h2 className={styles.heading}>{translatedTexts['Core Services'] || 'Core Services'}</h2>
            <div className={styles.doctorContainer}>
                {specialties.map((specialty, index) => (
                    <button
                        key={index}
                        className={styles.doctorBox}
                        onClick={() => handleClick(specialty)}
                    >
                        <div className={styles.boxContent}>
                            {specialty}
                            <span className={styles.arrow}>{' >'}</span>
                        </div>
                        <div className={styles.hoverLine}></div>
                    </button>
                ))}
            </div>
        </div>
    );
}
