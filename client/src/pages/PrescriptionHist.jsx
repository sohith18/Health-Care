import { useEffect, useState } from "react";
import styles from "../Styles/PrescriptionHist.module.css"; // Import CSS module
import PrescriptionDetails from "./PrescriptionDetails";

// const dummyData = [
//     {
//         doctor: {
//             name: "Dr. Bob",
//             specializations: ["Endocrinology", "Diabetology"]
//         },
//         slot: {
//             timeInterval: "10:00 AM - 11:00 AM"
//         },
//         prescription: {
//             medicines: [
//                 {
//                     name: "Metformin",
//                     details: "Take 1 tablet twice daily to control blood sugar levels."
//                 },
//                 {
//                     name: "Insulin",
//                     details: "Inject insulin as per the prescribed dosage, monitor blood sugar levels before each dose."
//                 }
//             ],
//             comments: "Monitor blood sugar levels regularly and avoid sugary foods."
//         }
//     },
//     {
//         doctor: {
//             name: "Dr. Clara",
//             specializations: ["Pulmonology", "Respiratory Medicine"]
//         },
//         slot: {
//             timeInterval: "2:00 PM - 3:00 PM"
//         },
//         prescription: {
//             medicines: [
//                 {
//                     name: "Salbutamol",
//                     details: "Use the inhaler 2 puffs every 4 hours during an asthma attack."
//                 },
//                 {
//                     name: "Prednisone",
//                     details: "Take 1 tablet daily in the morning for 5 days."
//                 }
//             ],
//             comments: "Avoid exposure to dust or allergens and rest to speed up recovery."
//         }
//     },
//     {
//         doctor: {
//             name: "Dr. David",
//             specializations: ["Dermatology", "Skin Care"]
//         },
//         slot: {
//             timeInterval: "3:00 PM - 4:00 PM"
//         },
//         prescription: {
//             medicines: [
//                 {
//                     name: "Clindamycin",
//                     details: "Apply a thin layer of Clindamycin gel on the affected area twice daily."
//                 },
//                 {
//                     name: "Hydrocortisone",
//                     details: "Use sparingly on the rash area to reduce inflammation."
//                 }
//             ],
//             comments: "Keep the affected area clean and avoid scratching. Apply sunscreen during the day."
//         }
//     },
//     {
//         doctor: {
//             name: "Dr. Emily",
//             specializations: ["Cardiology", "Hypertension"]
//         },
//         slot: {
//             timeInterval: "5:00 PM - 6:00 PM"
//         },
//         prescription: {
//             medicines: [
//                 {
//                     name: "Atenolol",
//                     details: "Take 1 tablet daily to control high blood pressure."
//                 },
//                 {
//                     name: "Amlodipine",
//                     details: "Take 1 tablet daily at bedtime to help relax blood vessels."
//                 }
//             ],
//             comments: "Monitor blood pressure regularly, reduce salt intake and exercise regularly."
//         }
//     },
//     {
//         doctor: {
//             name: "Dr. Henry",
//             specializations: ["Allergy & Immunology", "General Medicine"]
//         },
//         slot: {
//             timeInterval: "11:00 AM - 12:00 PM"
//         },
//         prescription: {
//             medicines: [
//                 {
//                     name: "Cetirizine",
//                     details: "Take 1 tablet daily to reduce allergic symptoms."
//                 },
//                 {
//                     name: "Nasal Spray",
//                     details: "Use 2 sprays in each nostril twice daily to relieve nasal congestion."
//                 }
//             ],
//             comments: "Avoid triggers like pollen, dust, and pet dander. Stay indoors during high pollen seasons."
//         }
//     }
// ];



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
                    console.log("data:",data); // Log the response data

                    // Extract prescriptions
                    const extractedPrescriptions = data.bookings.map(
                        (booking) => ({
                            doctor: booking.doctor,
                            slot: booking.slot,
                            medicines: booking.prescription.medicines,
                            comments: booking.prescription.comments
                        })
                    );

                    setLoading(false)

                    setPrescriptions(extractedPrescriptions); // Set prescriptions array
                } else {
                    console.log(response.status, response.statusText)
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
            {!selectedPrescription ? (
                <>
                    {console.log(prescriptions)}
                    <div className={styles.prescriptionsList}>
                        {!loading && prescriptions.map((prescription, index) => (
                            <div
                                key={index}
                                className={styles.prescriptionBox}
                            >
                                <h3>{prescription.doctor.name}</h3>
                                <div className={styles.specializationText}>
                                    {!loading &&prescription.doctor.specializations && prescription.doctor.specializations.join(", ")}
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
