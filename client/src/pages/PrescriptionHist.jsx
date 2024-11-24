import { useEffect, useState } from "react";
import styles from "../Styles/PrescriptionHist.module.css"; // Import CSS module
import PrescriptionDetails from "./PrescriptionDetails";



export default function PrescriptionHist() {
    const [prescriptions, setPrescriptions] = useState(); // Array of prescriptions
    const [selectedPrescription, setSelectedPrescription] = useState(null); // State for selected prescription
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    const AuthToken = localStorage.getItem("AuthToken"); // Retrieve AuthToken from local storage

    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await fetch("http://localhost:3000/booking", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${AuthToken}`, // Pass AuthToken for authentication
                    },
                });

                if (response.ok) {
                    const data = await response.json(); // Parse the JSON response
                    console.log(data); // Log the response data

                    // Extract prescriptions
                    const extractedPrescriptions = data.bookings.map(
                        (booking) => ({
                            doctor: booking.doctor.name,
                            slot: booking.slot.timeInterval,
                        })
                    );

                    setPrescriptions(extractedPrescriptions); // Set prescriptions array
                } else {
                    setError("Failed to fetch bookings.");
                }
            } catch (error) {
                setError("Error fetching bookings.");
            } finally {
                setLoading(false); // Stop loading indicator
            }
        }

        fetchBookings();
    }, [AuthToken]);


    const handleViewDetails = (prescription) => {
        setSelectedPrescription(prescription); // Set the clicked prescription
    };

    // Handle close details
    const handleCloseDetails = () => {
        setSelectedPrescription(null); // Clear the selected prescription
    };

    return (
        <div className={styles.container}>
            {!selectedPrescription ? (
                <>
                    <div className={styles.prescriptionsList}>
                        {prescriptions.map((prescription, index) => (
                            <div
                                key={index}
                                className={styles.prescriptionBox}
                            >
                                <h3>{prescription.doctor.name}</h3>
                                <div className={styles.specializationText}>
                                    {prescription.doctor.specializations.join(", ")}
                                </div>
                                <p>Slot: {prescription.slot.timeInterval}</p>
                                <button
                                    className={styles.viewDetailsBtn}
                                    onClick={() => handleViewDetails(prescription)}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <PrescriptionDetails
                    prescription={selectedPrescription}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
    

}
