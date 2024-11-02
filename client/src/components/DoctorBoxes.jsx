import styles from '../Styles/DoctorBoxes.module.css'; // Import your CSS module


export default function DoctorBoxes(){
    const specialties = [
        'Eye Specialist',
        'Cardiologist',
        'Dermatologist',
        'Pediatrician',
        'Orthopedic Surgeon',
        'Psychiatrist',
    ];

    const handleClick = (specialty) => {
        alert(`You clicked on ${specialty}`); // Replace with your desired action
    };

    return (
        <div>
            <h2 className={styles.heading}>Core Services</h2>
            <div className={styles.doctorContainer}>
                {specialties.map((specialty) => (
                    <button
                        key={specialty}
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