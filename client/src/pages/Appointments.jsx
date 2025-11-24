import React from "react"
import { useState, useEffect } from "react";
import classes from "../Styles/AppointmentsPage.module.css";
import SearchIcon from "../assets/search.png";

/* fetch + submit helpers with prescriptions hydration */
async function fetchAppointments(
  AuthToken,
  setAppointments,
  setIsFetching,
  setPrescriptions
) {
  if (AuthToken) {
    try {
      const response = await fetch("http://localhost:3000/booking", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthToken}`,
        },
      });

      const data = await response.json();
      console.log("Fetched appointments:", data);

      if (response.ok) {
        const bookings = data.bookings || [];
        setAppointments(bookings);

        // Build initial prescriptions state from backend data
        const initialPrescriptions = {};
        bookings.forEach((b) => {
          const p = b.prescription || {};
          const meds = (p.medicines || []).map((m) => ({
            name: m.name || "",
            details: m.details || "",
          }));
          initialPrescriptions[b._id] = {
            comments: p.comments || "",
            medicines: meds,
          };
        });
        setPrescriptions(initialPrescriptions);
      } else {
        console.error("Error fetching appointments:", data);
        setAppointments([]);
        setPrescriptions({});
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setPrescriptions({});
    } finally {
      setIsFetching(false);
    }
  } else {
    setIsFetching(false);
    setAppointments([]);
    setPrescriptions({});
  }
}

const handlePrescriptionSubmit = async (
  AuthToken,
  bookingID,
  prescription,
  setAppointments,
  setPrescriptions
) => {
  if (AuthToken) {
    try {
      const response = await fetch(`http://localhost:3000/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthToken}`,
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
        // Re-fetch to get latest data and re-hydrate prescriptions
        fetchAppointments(AuthToken, setAppointments, () => {}, setPrescriptions);
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
  // bookingID -> { medicines: [], comments: "" }
  const [prescriptions, setPrescriptions] = useState({});

  useEffect(() => {
    const AuthToken = localStorage.getItem("AuthToken");
    fetchAppointments(AuthToken, setAppointments, setIsFetching, setPrescriptions);
  }, []);

  const addMedicine = (bookingID) => {
    setPrescriptions((prev) => ({
      ...prev,
      [bookingID]: {
        comments: prev[bookingID]?.comments || "",
        medicines: [
          ...(prev[bookingID]?.medicines || []),
          { name: "", details: "" },
        ],
      },
    }));
  };

  const updateMedicine = (bookingID, index, field, value) => {
    setPrescriptions((prev) => {
      const current = prev[bookingID] || { medicines: [], comments: "" };
      const updated = [...(current.medicines || [])];
      updated[index] = { ...(updated[index] || {}), [field]: value };
      return {
        ...prev,
        [bookingID]: { ...current, medicines: updated },
      };
    });
  };

  const removeMedicine = (bookingID, index) => {
    setPrescriptions((prev) => {
      const current = prev[bookingID] || { medicines: [], comments: "" };
      const updated = [...(current.medicines || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        [bookingID]: { ...current, medicines: updated },
      };
    });
  };

  const updateComments = (bookingID, value) => {
    setPrescriptions((prev) => {
      const current = prev[bookingID] || { medicines: [], comments: "" };
      return {
        ...prev,
        [bookingID]: { ...current, comments: value },
      };
    });
  };

  const handleSubmit = (bookingID) => {
    const AuthToken = localStorage.getItem("AuthToken");
    const prescription =
      prescriptions[bookingID] || { medicines: [], comments: "" };
    handlePrescriptionSubmit(
      AuthToken,
      bookingID,
      prescription,
      setAppointments,
      setPrescriptions
    );
  };

  const filteredAppointments = appointments.filter((appointment) =>
    appointment?.patient?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className={classes.pageContainer}>
      <div className={classes.appointmentsContainer}>
        {/* Header + search */}
        <div className={classes.headerRow}>
          <h2 className={classes.pageTitle}>My Appointments</h2>

          <div
            className={classes.searchBar}
            role="search"
            aria-label="Search Patients"
          >
            <input
              type="text"
              placeholder="Search Patients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={classes.searchInput}
            />
            <button
              className={classes.searchButton}
              onClick={() => {
                document
                  .querySelector(`.${classes.searchInput}`)
                  ?.focus();
              }}
              aria-label="Search"
            >
              <img
                src={SearchIcon}
                alt="search"
                className={classes.searchIconImage}
              />
            </button>
          </div>
        </div>

        {/* Appointments list */}
        <div className={classes.appointmentsList}>
          {isFetching ? (
            <div className={classes.appointmentCard}>
              <p className={classes.loadingText}>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className={classes.appointmentCard}>
              <p className={classes.loadingText}>No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment._id || appointment.id || Math.random()}
                className={classes.appointmentCard}
              >
                <div className={classes.cardTopRow}>
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
                      <div className={classes.patientName}>
                        Patient: {appointment.patient.name}
                      </div>
                      <div className={classes.meta}>
                        Doctor: {appointment.doctor.name} • Slot:{" "}
                        {appointment.slot.timeInterval}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={classes.prescriptionSection}>
                  <h3 className={classes.sectionTitle}>Prescription</h3>
                  <textarea
                    className={classes.commentsInput}
                    placeholder="Add comments"
                    value={prescriptions[appointment._id]?.comments || ""}
                    onChange={(e) =>
                      updateComments(appointment._id, e.target.value)
                    }
                  />

                  {(prescriptions[appointment._id]?.medicines || []).map(
                    (med, medIndex) => (
                      <div
                        key={medIndex}
                        className={classes.medicineEntry}
                      >
                        <input
                          type="text"
                          placeholder="Medicine Name"
                          className={classes.medicineInput}
                          value={med.name}
                          onChange={(e) =>
                            updateMedicine(
                              appointment._id,
                              medIndex,
                              "name",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          placeholder="Details (e.g., 1 tablet twice a day)"
                          className={classes.dosageInput}
                          value={med.details}
                          onChange={(e) =>
                            updateMedicine(
                              appointment._id,
                              medIndex,
                              "details",
                              e.target.value,
                            )
                          }
                        />
                        <button
                          className={classes.removeButton}
                          onClick={() =>
                            removeMedicine(appointment._id, medIndex)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ),
                  )}

                  <div className={classes.actionsRow}>
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
                    {/* optional video call button */}
                    {/* <a
                      href={appointment.videoCallLink}
                      target="_blank"
                      rel="noreferrer"
                      className={classes.videoCallButton}
                    >
                      Join Video Call
                    </a> */}
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
