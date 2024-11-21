import styles from '../Styles/JoinPage.module.css';
import { useState } from 'react';

const JoinPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const doctors = [
    "Cardiology", 
    "Neurology", 
    "Orthopedic Surgery", 
    "Pediatrics", 
    "Psychiatry", 
    "Dermatology", 
    "Internal Medicine", 
    "Orthodontics"
  ]

  const handleJoin = () => {
    if (selectedDoctor) {
      alert(`Joining meeting with ${selectedDoctor}`);
    } else {
      alert("Please select a doctor before joining!");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Join a Meeting</h1>
      <label htmlFor="doctorSelect" className={styles.label}>
        Select a Specialized Doctor:
      </label>
      <select
        id="doctorSelect"
        className={styles.dropdown}
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
      >
        <option value="">-- Select a Doctor --</option>
        {doctors.map((doctor, index) => (
          <option key={index} value={doctor}>
            {doctor}
          </option>
        ))}
      </select>
      <button className={styles.joinButton} onClick={handleJoin}>
        Join Meeting
      </button>
    </div>
  );
};

export default JoinPage;
