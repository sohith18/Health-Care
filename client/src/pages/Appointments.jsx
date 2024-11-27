import { useState, useEffect } from "react";
import classes from "../Styles/AppointmentsPage.module.css";

async function fetchAppointments(AuthToken, setAppointments, setIsFetching) {
    if (AuthToken) {
        try {
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

const handlePrescriptionSubmit = async (AuthToken, bookingID, prescription, setAppointments) => {
    if (AuthToken) {
        try {
            const response = await fetch(`http://localhost:3000/booking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AuthToken}`,
                },
                body: JSON.stringify({
                    bookingID,
                    medicines: prescription.medicines,
                    comments: prescription.comments,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Prescription submitted successfully");
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
    const [isFetching, setIsFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [prescriptions, setPrescriptions] = useState({}); // Maps bookingID to { medicines: [], comments: "" }

    useEffect(() => {
        const AuthToken = localStorage.getItem("AuthToken");
        fetchAppointments(AuthToken, setAppointments, setIsFetching);
    }, []);

    const addMedicine = (bookingID) => {
        setPrescriptions((prev) => ({
            ...prev,
            [bookingID]: {
                ...prev[bookingID],
                medicines: [
                    ...(prev[bookingID]?.medicines || []),
                    { name: "", details: "" },
                ],
            },
        }));
    };

    const updateMedicine = (bookingID, index, field, value) => {
        setPrescriptions((prev) => {
            const updatedMedicines = [...(prev[bookingID]?.medicines || [])];
            updatedMedicines[index][field] = value;
            return { ...prev, [bookingID]: { ...prev[bookingID], medicines: updatedMedicines } };
        });
    };

    const removeMedicine = (bookingID, index) => {
        setPrescriptions((prev) => {
            const updatedMedicines = [...(prev[bookingID]?.medicines || [])];
            updatedMedicines.splice(index, 1);
            return { ...prev, [bookingID]: { ...prev[bookingID], medicines: updatedMedicines } };
        });
    };

    const updateComments = (bookingID, value) => {
        setPrescriptions((prev) => ({
            ...prev,
            [bookingID]: { ...prev[bookingID], comments: value },
        }));
    };

    const handleSubmit = (bookingID) => {
        const AuthToken = localStorage.getItem("AuthToken");
        const prescription = prescriptions[bookingID] || { medicines: [], comments: "" };
        console.log("prescription: ",bookingID,prescription)
        handlePrescriptionSubmit(AuthToken, bookingID, prescription, setAppointments);
    };

    const filteredAppointments = appointments.filter((appointment) =>
        appointment.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    { console.log(appointments) }
                    {filteredAppointments.length === 0 ? (
                        <p>No appointments found</p>
                    ) : (
                        filteredAppointments.map((appointment, index) => (
                            <div key={index} className={classes.appointmentCard}>
                                <h3>Patient Name: {appointment.patient.name}</h3>
                                <p>Doctor: {appointment.doctor.name}</p>
                                <p>Slot: {appointment.slot.timeInterval}</p>
                                <div>
                                    <h4>Prescription</h4>
                                    <textarea
                                        className={classes.commentsInput}
                                        placeholder="Add comments"
                                        value={prescriptions[appointment._id]?.comments || ""}
                                        onChange={(e) => updateComments(appointment._id, e.target.value)}
                                    />
                                    {(prescriptions[appointment._id]?.medicines || []).map((med, medIndex) => (
                                        <div key={medIndex} className={classes.medicineEntry}>
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                className={classes.medicineInput}
                                                value={med.name}
                                                onChange={(e) =>
                                                    updateMedicine(appointment._id, medIndex, "name", e.target.value)
                                                }
                                            />
                                            <input
                                                type="text"
                                                placeholder="Details (e.g., 1 tablet twice a day)"
                                                className={classes.dosageInput}
                                                value={med.details}
                                                onChange={(e) =>
                                                    updateMedicine(appointment._id, medIndex, "details", e.target.value)
                                                }
                                            />
                                            <button
                                                className={classes.removeButton}
                                                onClick={() => removeMedicine(appointment._id, medIndex)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className={classes.addButton}
                                        onClick={() => addMedicine(appointment._id)}
                                    >
                                        Add Medicine
                                    </button>
                                    <button
                                        className={classes.submitButton}
                                        onClick={() => handleSubmit(appointment._id)}
                                    >
                                        Submit Prescription
                                    </button>
                                    {/* <a
                                        href={appointment.videoCallLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={classes.videoCallButton}
                                    >
                                        Join Video Call
                                    </a> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
