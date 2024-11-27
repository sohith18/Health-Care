import styles from '../Styles/JoinPage.module.css';
import { useState, useContext } from 'react';
import { TranslationContext } from "../store/TranslationContext";
import { useNavigate } from 'react-router-dom';

const JoinPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const { translatedTexts } = useContext(TranslationContext); // Translation context
  const navigate = useNavigate();

  const doctors = [
    "Cardiology", 
    "Neurology", 
    "Orthopedic Surgery", 
    "Pediatrics", 
    "Psychiatry", 
    "Dermatology", 
    "Internal Medicine", 
    "Orthodontics"
  ];

  const handleJoin = () => {
    navigate(`/video-call/meeting`,
      {
        state: { specialization: selectedDoctor, create: true}
      }
      );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{'Join a Meeting'||translatedTexts['Join a Meeting']}</h1>
      <label htmlFor="doctorSelect" className={styles.label}>
        {'Select a Specialized Doctor:'||translatedTexts['Select a Specialized Doctor:']}
      </label>
      <select
        id="doctorSelect"
        className={styles.dropdown}
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
      >
        <option value="">{'-- Select a Doctor --'|| translatedTexts['-- Select a Doctor --']}</option>
        {doctors.map((doctor, index) => (
          <option key={index} value={doctor}>
            {translatedTexts[doctor] || doctor}
          </option>
        ))}
      </select>
      <button className={styles.joinButton} onClick={handleJoin}>
        {'Join Meeting'||translatedTexts['Join Meeting']}
      </button>
    </div>
  );
};

export default JoinPage;
