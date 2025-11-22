import { useState, useEffect } from "react";
import classes from "../Styles/AppointmentsPage.module.css";
import SearchIcon from "../assets/search.png"

/* same fetch + submit helpers as before (unchanged) */
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
  } else {
    setIsFetching(false);
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
      alert("Failed to submit prescription");
    }
  } else {
    alert("Not authenticated");
  }
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [prescriptions, setPrescriptions] = useState({}); // Maps bookingID -> { medicines: [], comments: "" }

  useEffect(() => {
    const AuthToken = localStorage.getItem("AuthToken");
    fetchAppointments(AuthToken, setAppointments, setIsFetching);
  }, []);

  const addMedicine = (bookingID) => {
    setPrescriptions((prev) => ({
      ...prev,
      [bookingID]: {
        ...prev[bookingID],
        medicines: [...(prev[bookingID]?.medicines || []), { name: "", details: "" }],
      },
    }));
  };

  const updateMedicine = (bookingID, index, field, value) => {
    setPrescriptions((prev) => {
      const updated = [...(prev[bookingID]?.medicines || [])];
      updated[index] = { ...(updated[index] || {}), [field]: value };
      return { ...prev, [bookingID]: { ...prev[bookingID], medicines: updated } };
    });
  };

  const removeMedicine = (bookingID, index) => {
    setPrescriptions((prev) => {
      const updated = [...(prev[bookingID]?.medicines || [])];
      updated.splice(index, 1);
      return { ...prev, [bookingID]: { ...prev[bookingID], medicines: updated } };
    });
  };

  const updateComments = (bookingID, value) => {
    setPrescriptions((prev) => ({ ...prev, [bookingID]: { ...prev[bookingID], comments: value } }));
  };

  const handleSubmit = (bookingID) => {
    const AuthToken = localStorage.getItem("AuthToken");
    const prescription = prescriptions[bookingID] || { medicines: [], comments: "" };
    handlePrescriptionSubmit(AuthToken, bookingID, prescription, setAppointments);
  };

  const filteredAppointments = appointments.filter((appointment) =>
    appointment?.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={classes.pageContainer}>
      <div className={classes.centerWrap}>
        {/* optional title */}
        <h2 className={classes.pageTitle}>Find Appointments</h2>

        {/* Search shell centered */}
        <div className={classes.searchShell} role="search" aria-label="Search Patients">
          <div className={classes.searchInner}>
            <input
              type="text"
              placeholder="Search Patients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={classes.searchInput}
            />
            <button
              className={classes.searchBtn}
              onClick={() => {
                /* optional action: focus input or run filtering */
                // For now simply focus:
                document.querySelector(`.${classes.searchInput}`)?.focus();
              }}
              aria-label="Search"
            >
              <img
              src={SearchIcon}
              alt="search-sample"
              className={classes.sampleRef}
            />
            </button>
          </div>

        </div>

        {/* Appointments list (appears below the centered search) */}
        <div className={classes.appointmentsArea}>
          {isFetching ? (
            <div className={classes.appointmentCard}>
              <p className={classes.meta}>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className={classes.appointmentCard}>
              <p className={classes.meta}>No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment._id || appointment.id || Math.random()} className={classes.appointmentCard}>
                <div className={classes.cardHeader}>
                  <div className={classes.patientInfo}>
                    <img
                      src={appointment?.patient?.profile_picture || ""}
                      alt={appointment?.patient?.name || "patient"}
                      className={classes.avatar}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div>
                      <div className={classes.patientName}>Patient: {appointment.patient.name}</div>
                      <div className={classes.meta}>Doctor: {appointment.doctor.name} • Slot: {appointment.slot.timeInterval}</div>
                    </div>
                  </div>
                </div>

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
                        onChange={(e) => updateMedicine(appointment._id, medIndex, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Details (e.g., 1 tablet twice a day)"
                        className={classes.dosageInput}
                        value={med.details}
                        onChange={(e) => updateMedicine(appointment._id, medIndex, "details", e.target.value)}
                      />
                      <button className={classes.removeButton} onClick={() => removeMedicine(appointment._id, medIndex)}>
                        Remove
                      </button>
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button className={classes.addButton} onClick={() => addMedicine(appointment._id)}>
                      Add Medicine
                    </button>
                    <button className={classes.submitButton} onClick={() => handleSubmit(appointment._id)}>
                      Submit Prescription
                    </button>
                    {/* optional video call button */}
                    {/* <a href={appointment.videoCallLink} target="_blank" rel="noreferrer" className={classes.videoCallButton}>Join Video Call</a> */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
