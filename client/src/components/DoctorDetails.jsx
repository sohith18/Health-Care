import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import styles from '../Styles/DoctorDetails.module.css';
import { TranslationContext } from "../store/TranslationContext";

export default function DoctorDetails() {
    const { id } = useParams(); // Extract the doctor ID from the route parameters
    const [doctor, setDoctor] = useState(null); // State to hold doctor data
    const [appointmentTime, setAppointmentTime] = useState(''); // State to store selected appointment time
    const { translatedTexts } = useContext(TranslationContext); // Translation context
    const AuthToken = localStorage.getItem('AuthToken'); // Retrieve AuthToken from local storage
    const search = {
        id: id, // Search object containing the doctor ID
    };

    useEffect(() => {
        async function fetchDoctors() {
            try {
                const response = await fetch("http://localhost:3000/doctor", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${AuthToken}`, // Pass AuthToken for authentication
                    },
                    body: JSON.stringify(search), // Send the doctor ID in the request body
                });

                if (response.ok) {
                    const data = await response.json(); // Parse the JSON response
                    console.log(data.doctors); // Log the response data
                    setDoctor(data.doctors[0]); // Set the doctor data in state
                } else {
                    console.error("Failed to fetch doctor details:", response.status);
                }
            } catch (error) {
                console.error("Error fetching doctors data:", error);
            }
        }

        fetchDoctors(); // Fetch doctor data when the component mounts
    }, [AuthToken, id]); // Re-run the effect if AuthToken or id changes

    async function handleBookAppointment(docId, slotId, time) {
        setAppointmentTime(time);
        try {
            const response = await fetch("http://localhost:3000/booking", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${AuthToken}`, // Pass AuthToken for authentication
                },
                body: JSON.stringify({doctorID: docId, slotID: slotId}), // Send the doctor ID in the request body
            });

            if (response.ok) {
                const data = await response.json(); // Parse the JSON response
                console.log(data); // Log the response data
            } else {
                console.error("Failed to fetch doctor details:", response.status);
            }
        } catch (error) {
            console.error("Error fetching doctors data:", error);
        }
        console.log(`${translatedTexts['Appointment booked at']} ${time} ${translatedTexts['with']} ${doctor?.name}`);

    }

    if (!doctor) return <div>{translatedTexts['Loading...'] || "Loading..."}</div>;

    return (
        <div className={styles.doctorDetailsContainer}>
            {/* Doctor Info Card */}
            {console.log(doctor)}
            <div className={styles.doctorInfoCard}>
                <div className={styles.doctorInfoLeft}>
                    <img
                        src={doctor.profile_picture || "https://via.placeholder.com/150"}
                        alt={doctor.name || "Doctor"}
                        className={styles.doctorImage}
                    />
                </div>
                <div className={styles.doctorInfoRight}>
                    <h2>{doctor.name || translatedTexts['Unknown Doctor'] || "Unknown Doctor"}</h2>
                    <p>
                        <strong>{translatedTexts['Qualifications:'] || 'Qualifications:'} </strong>
                        {doctor.qualifications ? doctor.qualifications.join(", ") : translatedTexts['N/A'] || "N/A"}
                    </p>
                    <p>
                        <strong>{translatedTexts['Specializations:'] || 'Specializations:'} </strong>
                        {doctor.specializations ? doctor.specializations.join(", ") : translatedTexts['N/A'] || "N/A"}
                    </p>
                    <p>
                        <strong>{translatedTexts['Experience:'] || 'Experience:'} </strong> {doctor.experience || translatedTexts['N/A'] || "N/A"} {translatedTexts['years'] || 'years'}
                    </p>
                    <p>
                        <strong>{translatedTexts['Description:'] || 'Description:'} </strong> {doctor.description || translatedTexts['N/A'] || "N/A"}
                    </p>
                </div>
            </div>

            {/* Available Times Card */}
            <div className={styles.availableTimesCard}>
                <h3>{translatedTexts['Available Timings'] || 'Available Timings'}</h3>
                <div className={styles.timeButtons}>
                    {doctor.slots?.length > 0 ? (
                        doctor.slots.map((slot, index) => (
                            <button
                                key={index}
                                className={styles.timeButton}
                                onClick={() => handleBookAppointment(doctor._id, slot._id, slot.timeInterval)}
                                disabled={slot.capacity === 0}
                            >
                                {slot.timeInterval}
                            </button>
                        ))
                    ) : (
                        <p>{translatedTexts['No available times'] || 'No available times'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
