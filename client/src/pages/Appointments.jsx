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
                console.log(data);
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
                method: "POST",
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
    const [searchQuery, setSearchQuery] = useState("");
    const [prescriptions, setPrescriptions] = useState({}); // Maps appointment ID to prescription

    useEffect(() => {
        const AuthToken = localStorage.getItem("AuthToken");
        fetchAppointments(AuthToken, setAppointments, setIsFetching);
    }, []);

    const addMedicine = (appointmentId) => {
        setPrescriptions((prev) => ({
            ...prev,
            [appointmentId]: [
                ...(prev[appointmentId] || []),
                { medicine: "", dosage: "" },
            ],
        }));
    };

    const updateMedicine = (appointmentId, index, field, value) => {
        setPrescriptions((prev) => {
            const updatedPrescription = [...(prev[appointmentId] || [])];
            updatedPrescription[index][field] = value;
            return { ...prev, [appointmentId]: updatedPrescription };
        });
    };

    const removeMedicine = (appointmentId, index) => {
        setPrescriptions((prev) => {
            const updatedPrescription = [...(prev[appointmentId] || [])];
            updatedPrescription.splice(index, 1);
            return { ...prev, [appointmentId]: updatedPrescription };
        });
    };

    const handleSubmit = (appointmentId) => {
        const AuthToken = localStorage.getItem("AuthToken");
        const prescription = prescriptions[appointmentId] || [];
        handlePrescriptionSubmit(AuthToken, appointmentId, prescription, setAppointments);
    };

    const filteredAppointments = appointments.filter((appointment) =>
        appointment.patient.name.includes(searchQuery.toLowerCase())
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
                                <h3>Patient Name: {appointment.patient.name}</h3>
                                <p>Doctor: {appointment.doctor.name}</p>
                                <p>Slot: {appointment.slot.timeInterval}</p>
                                <div>
                                    <h4>Add Prescription</h4>
                                    {(prescriptions[appointment.id] || []).map((med, medIndex) => (
                                        <div key={medIndex} className={classes.medicineEntry}>
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                className={classes.medicineInput}
                                                value={med.medicine}
                                                onChange={(e) =>
                                                    updateMedicine(appointment.id, medIndex, "medicine", e.target.value)
                                                }
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage (e.g., 1 tablet twice a day)"
                                                className={classes.dosageInput}
                                                value={med.dosage}
                                                onChange={(e) =>
                                                    updateMedicine(appointment.id, medIndex, "dosage", e.target.value)
                                                }
                                            />
                                            <button
                                                className={classes.removeButton}
                                                onClick={() => removeMedicine(appointment.id, medIndex)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className={classes.addButton}
                                        onClick={() => addMedicine(appointment.id)}
                                    >
                                        Add Medicine
                                    </button>
                                    <button
                                        className={classes.submitButton}
                                        onClick={() => handleSubmit(appointment.id)}
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
