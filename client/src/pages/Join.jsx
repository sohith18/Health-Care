import React from "react"
import styles from "../Styles/JoinPage.module.css";
import { useState, useContext } from "react";
import { TranslationContext } from "../store/TranslationContext";
import { useNavigate } from "react-router-dom";

const JoinPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const { translatedTexts } = useContext(TranslationContext);
  const navigate = useNavigate();

  const doctors = [
    "Cardiology",
    "Neurology",
    "Orthopedic Surgery",
    "Pediatrics",
    "Psychiatry",
    "Dermatology",
    "Internal Medicine",
    "Orthodontics",
  ];

  const handleJoin = () => {
    if (!selectedDoctor) {
      alert("Please select a specialization first");
      return;
    }

    // Use new pretty route: specialization in URL, placeholder callId for new meeting
    const specSegment = encodeURIComponent(selectedDoctor);

    navigate(`/video-call/meeting/${specSegment}/new`, {
      state: {
        specialization: selectedDoctor,
        create: true,          // tells VideoCall to create the call
        callId: null,          // backend will create a new Meet for PATIENT
      },
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {translatedTexts["Join a Meeting"] || "Join a Meeting"}
      </h1>

      <label htmlFor="doctorSelect" className={styles.label}>
        {translatedTexts["Select a Specialized Doctor:"] ||
          "Select a Specialized Doctor:"}
      </label>

      <select
        id="doctorSelect"
        className={styles.dropdown}
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
      >
        <option value="">
          {translatedTexts["-- Select a Doctor --"] ||
            "-- Select a Doctor --"}
        </option>
        {doctors.map((doctor, index) => (
          <option key={index} value={doctor}>
            {translatedTexts[doctor] || doctor}
          </option>
        ))}
      </select>

      <button className={styles.joinButton} onClick={handleJoin}>
        {translatedTexts["Join Meeting"] || "Join Meeting"}
      </button>
    </div>
  );
};

export default JoinPage;
