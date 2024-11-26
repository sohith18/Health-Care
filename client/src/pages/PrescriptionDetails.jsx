import styles from "../Styles/PrescriptionDetails.module.css"; // Import new CSS for details component

const PrescriptionDetails = ({ prescription, onClose }) => {
    return (
        <div className={styles.detailsContainer}>
            {/* Doctor's Name and Close Button on the Same Line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{prescription.doctor.name}</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    Close
                </button>
            </div>

            {/* Slot and Specializations on the Same Line */}
            <div className={styles.slotSpecializationContainer}>
                <span>Specializations: </span>
                <span className={styles.value}>{prescription.doctor.specializations.join(', ')}</span>
            </div>
            <div className={styles.slotSpecializationContainer}>
                <span>Slot: </span>
                <span className={styles.value}>{prescription.slot.timeInterval}</span>
            </div>

            <h3>Prescription Details:</h3>
            {prescription.medicines.map((medicine, index) => (
                <div key={index} className={styles.medicineBox}>
                    <h4>{medicine.name}</h4>
                    <p>{medicine.details}</p>
                </div>
            ))}

            <h3>Comments:</h3>
            <p>{prescription.comments}</p>
        </div>


    );
};

export default PrescriptionDetails;
