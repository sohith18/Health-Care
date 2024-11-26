import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import styles from "../Styles/PrescriptionHist.module.css"; // Import CSS module
import PrescriptionDetails from "./PrescriptionDetails";

export default function PrescriptionHist() {
    const [prescriptions, setPrescriptions] = useState([]); // Initialize as empty array
    const [selectedPrescription, setSelectedPrescription] = useState(null); // State for selected prescription
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    const navigate = useNavigate(); // Initialize useNavigate

    const AuthToken = localStorage.getItem("AuthToken"); // Retrieve AuthToken from local storage

    useEffect(() => {
        // If AuthToken is not present, redirect to login
        if (!AuthToken) {
            navigate("/login"); // Adjust the path as needed
            return;
        }

        async function fetchBookings() {
            try {
                const response = await fetch("http://localhost:3000/booking", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${AuthToken}`, // Pass AuthToken for authentication
                    },
                });

                console.log("status:", response); // Log the response

                if (response.ok) {
                    const data = await response.json(); // Parse the JSON response
                    console.log("data:", data); // Log the response data

                    // Extract prescriptions
                    const extractedPrescriptions = data.bookings.map((booking) => {
                        if (!booking.prescription) return null;
                        return {
                            doctor: booking.doctor,
                            slot: booking.slot,
                            medicines: booking.prescription.medicines,
                            comments: booking.prescription.comments,
                        };
                    });

                    // Filter out null prescriptions and set the state
                    const validPrescriptions = extractedPrescriptions.filter(
                        (prescription) => prescription !== null
                    );

                    setPrescriptions(validPrescriptions); // Set prescriptions array
                } else if (response.status === 401) {
                    navigate("/login");
                } else {
                    console.log(response.status, response.statusText);
                    setError("Failed to fetch bookings.");
                }
            } catch (error) {
                setError("Error fetching bookings.");
            } finally {
                setLoading(false); // Stop loading indicator
            }
        }

        fetchBookings();
    }, [AuthToken, navigate]);

    // Handle prescription click
    const handleViewDetails = (prescription) => {
        setSelectedPrescription(prescription); // Set the clicked prescription
    };

    // Handle close details
    const handleCloseDetails = () => {
        setSelectedPrescription(null); // Clear the selected prescription
    };

    return (
        <div className={styles.container}>
            {loading ? (
                <p>Loading...</p> 
            ) : error ? (
                <p className={styles.error}>{error}</p> 
            ) : selectedPrescription ? (
                <PrescriptionDetails
                    prescription={selectedPrescription}
                    onClose={handleCloseDetails}
                />
            ) : prescriptions.length > 0 ? (
                <div className={styles.prescriptionsList}>
                    {prescriptions.map((prescription, index) => (
                        <div key={index} className={styles.prescriptionBox}>
                            <h3>{prescription.doctor.name}</h3>
                            <div className={styles.specializationText}>
                                {prescription.doctor.specializations &&
                                    prescription.doctor.specializations.join(", ")}
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
            ) : (
                <p>No prescriptions are found.</p> // Display message when no prescriptions
            )}
        </div>
    );
}
