import React, { useContext } from 'react';
import styles from '../Styles/DoctorInfo.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslationContext } from '../store/TranslationContext';

export default function DoctorsInfo({ doctorsData }) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const { translatedTexts } = useContext(TranslationContext);

    const doctorsPerPage = 5;
    const indexOfLastDoctor = currentPage * doctorsPerPage;
    const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
    const currentDoctors = doctorsData.slice(indexOfFirstDoctor, indexOfLastDoctor);

    function handleBookAppointment(doctorId) {
        navigate(`/doctor/${doctorId}`);
    }

    const handleNextPage = () => {
        if (currentPage < Math.ceil(doctorsData.length / doctorsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className={styles.container}>
            {currentDoctors.length > 0 ? (currentDoctors.map((doctor, index) => (
                <div key={index} className={styles.doctorBox}>
                    <div className={styles.info}>
                        <h2 className={styles.doctorName}>{doctor.name}</h2>
                        <div className={styles.education}>
                            {doctor.qualifications.join(', ')}
                        </div>
                        <p className={styles.experience}>
                            <span>{translatedTexts['Specialized in:'] || 'Specialized in:'}</span>
                            {doctor.experience} {translatedTexts['years of experience'] || 'years of experience'}
                        </p>
                        <button 
                            className={styles.bookButton} 
                            onClick={() => handleBookAppointment(doctor._id)}
                        >
                            {translatedTexts['Book Appointment'] || 'Book Appointment'}
                        </button>
                    </div>
                    <div className={styles.imageContainer}>
                        <img
                            src={doctor.profile_picture} // Ensure `doctorsData` has an `image` property
                            alt={doctor.name}
                            className={styles.doctorImage}
                        />
                    </div>
                </div>
            ))): <p>{translatedTexts['No doctors found based on the selected filters.'] || 'No doctors found based on the selected filters.'}</p>}

            <div className={styles.paginationControls}>
                <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1}
                >
                    {translatedTexts['Previous'] || 'Previous'}
                </button>
                <span>{translatedTexts['Page'] || 'Page'} {currentPage}</span>
                <button 
                    onClick={handleNextPage} 
                    disabled={currentPage >= Math.ceil(doctorsData.length / doctorsPerPage)}
                >
                    {translatedTexts['Next'] || 'Next'}
                </button>
            </div>
        </div>
    );
}
