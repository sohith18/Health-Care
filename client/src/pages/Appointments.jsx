import { useState, useEffect } from "react";
import classes from "../Styles/AppointmentsPage.module.css";

async function fetchAppointments(AuthToken, setAppointments, setIsFetching) {
    if (AuthToken) {
        try {
            setIsFetching(true);
            const response = await fetch("http://localhost:3000/booking", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AuthToken}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setAppointments(data.bookings);
            } else {
                console.error("Error fetching appointments:", data);
                setAppointments([]);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAppointments([]);
        } finally {
            setIsFetching(false);
        }
    }
}

const handlePrescriptionSubmit = async (AuthToken, appointmentId, prescription, setAppointments) => {
    if (AuthToken) {
        try {
            const response = await fetch(`http://localhost:3000/booking`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AuthToken}`,
                },
                body: JSON.stringify({ appointmentId, prescription }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Prescription submitted successfully");
                // Refresh the appointments list
                fetchAppointments(AuthToken, setAppointments, () => {});
            } else {
                console.error("Error submitting prescription:", data);
                alert("Failed to submit prescription");
            }
        } catch (error) {
            console.error("Error submitting prescription:", error);
        }
    }
};

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [currentPrescription, setCurrentPrescription] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const AuthToken = localStorage.getItem("AuthToken");
        fetchAppointments(AuthToken, setAppointments, setIsFetching);
    }, []);

    // Filter appointments based on the search query
    const filteredAppointments = appointments.filter((appointment) =>
        appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={classes.pageContainer}>
            <h1>Appointments</h1>
            <input
                type="text"
                placeholder="Search by patient name"
                className={classes.searchBar}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isFetching ? (
                <p>Loading appointments...</p>
            ) : (
                <div>
                    {filteredAppointments.length === 0 ? (
                        <p>No appointments found</p>
                    ) : (
                        filteredAppointments.map((appointment, index) => (
                            <div key={index} className={classes.appointmentCard}>
                                <h3>Patient Name: {appointment.patientName}</h3>
                                <p>Doctor: {appointment.doctor.name}</p>
                                <p>Slot: {appointment.slot}</p>
                                <div>
                                    <textarea
                                        className={classes.prescriptionInput}
                                        placeholder="Write prescription here..."
                                        value={currentPrescription}
                                        onChange={(e) => setCurrentPrescription(e.target.value)}
                                    />
                                    <button
                                        className={classes.submitButton}
                                        onClick={() =>
                                            handlePrescriptionSubmit(
                                                localStorage.getItem("AuthToken"),
                                                appointment.id,
                                                currentPrescription,
                                                setAppointments
                                            )
                                        }
                                    >
                                        Submit Prescription
                                    </button>
                                    <a
                                        href={appointment.videoCallLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={classes.videoCallButton}
                                    >
                                        Join Video Call
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
