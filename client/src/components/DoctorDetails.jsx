import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Styles/DoctorDetails.module.css';

const docData = [
    {   
        id: 1,
        name: 'Dr. John Doe',
        education: ['MBBS', 'MD'],
        specializations: ['Cardiologist', 'Dentist'],
        experience: 5,
        availableTimes: ['10:00 AM', '11:00 AM', '12:00 PM'],
        description: 'Dr. John is a highly skilled Cardiologist with over 5 years of experience.',
        image: 'https://via.placeholder.com/150'  // Placeholder image URL for Dr. John
    },
    {   
        id: 2,
        name: 'Dr. Jane Doe',
        education: ['MBBS', 'MD'],
        specializations: ['Dermatologist', 'ENT'],
        experience: 10,
        availableTimes: ['2:00 PM', '3:00 PM', '4:00 PM'],
        description: 'Dr. Jane specializes in Dermatology and ENT with 10 years of experience.',
        image: 'https://via.placeholder.com/150'  // Placeholder image URL for Dr. Jane
    },
];

export default function DoctorDetails() {
    const { id } = useParams(); 
    const [doctor, setDoctor] = useState(null);
    const [appointmentTime, setAppointmentTime] = useState('');

    useEffect(() => {
        setDoctor(docData.find((doc) => doc.id === parseInt(id)));
    }, [id]);

    function handleBookAppointment(time) {
        setAppointmentTime(time);
        // Here, you can implement the logic to book the appointment, e.g., making an API call
        console.log(`Appointment booked at ${time} with Dr. ${doctor.name}`);
    }

    if (!doctor) return <div>Loading...</div>;

    return (
        <div className={styles.doctorDetailsContainer}>
            {/* Doctor Info Card */}
            <div className={styles.doctorInfoCard}>
                <div className={styles.doctorInfoLeft}>
                    <img src={doctor.image} alt={doctor.name} className={styles.doctorImage} />
                </div>
                <div className={styles.doctorInfoRight}>
                    <h2>{doctor.name}</h2>
                    <p><strong>Education:</strong> {doctor.education.join(', ')}</p>
                    <p><strong>Specializations:</strong> {doctor.specializations.join(', ')}</p>
                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                    <p><strong>Description:</strong> {doctor.description}</p>
                </div>
            </div>

            {/* Available Times Card */}
            <div className={styles.availableTimesCard}>
                <h3>Available Times</h3>
                <div className={styles.timeButtons}>
                    {doctor.availableTimes.map((time, index) => (
                        <button
                            key={index}
                            className={styles.timeButton}
                            onClick={() => handleBookAppointment(time)}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
