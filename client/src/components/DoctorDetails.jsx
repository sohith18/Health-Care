import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from '../Styles/DoctorDetails.module.css';

export default function DoctorDetails() {
    const { id } = useParams(); // Extract the doctor ID from the route parameters
    const [doctor, setDoctor] = useState(null); // State to hold doctor data
    const [appointmentTime, setAppointmentTime] = useState(''); // State to store selected appointment time

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

    function handleBookAppointment(time) {
        setAppointmentTime(time);
        console.log(`Appointment booked at ${time} with Dr. ${doctor?.name}`);
        // Add logic to book the appointment here (e.g., API call to save the booking)
    }

    if (!doctor) return <div>Loading...</div>; // Display a loading message until data is fetched

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
                    <h2>{doctor.name || "Unknown Doctor"}</h2>
                    <p>
                        <strong>Qualifications:</strong>{" "}
                        {doctor.qualifications ? doctor.qualifications.join(", ") : "N/A"}
                    </p>
                    <p>
                        <strong>Specializations:</strong>{" "}
                        {doctor.specializations ? doctor.specializations.join(", ") : "N/A"}
                    </p>
                    <p>
                        <strong>Experience:</strong> {doctor.experience || "N/A"} years
                    </p>
                    <p>
                        <strong>Description:</strong> {doctor.description || "N/A"}
                    </p>
                </div>
            </div>

            {/* Available Times Card */}
            <div className={styles.availableTimesCard}>
                <h3>Available Times</h3>
                <div className={styles.timeButtons}>
                    {doctor.availableTimes?.length > 0 ? (
                        doctor.availableTimes.map((time, index) => (
                            <button
                                key={index}
                                className={styles.timeButton}
                                onClick={() => handleBookAppointment(time)}
                            >
                                {time}
                            </button>
                        ))
                    ) : (
                        <p>No available times</p>
                    )}
                </div>
            </div>
        </div>
    );
}
