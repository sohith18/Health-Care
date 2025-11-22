import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import classes from "../Styles/ProfileChangeDoctor.module.css";
import { TranslationContext } from "../store/TranslationContext";



/* ---------------------------
   Helpers: API calls
   --------------------------- */
async function getDoctorData(AuthToken, setData, setIsFetching) {
  if (!AuthToken) {
    setIsFetching(false);
    return;
  }
  try {
    setIsFetching(true);
    const response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AuthToken}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      setData(data.user);
    } else {
      setData(null);
    }
  } catch (err) {
    console.error("Error fetching doctor data:", err);
    setData(null);
  }
  setIsFetching(false);
}

const handleUpdateDoctor = async (AuthToken, userData, setIsFetching) => {
  if (!AuthToken) return;
  try {
    setIsFetching(true);
    const response = await fetch("http://localhost:3000/doctor", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AuthToken}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.msg || "Updated");
    } else {
      alert(data.msg || "Failed to update");
    }
  } catch (error) {
    console.error("Error updating doctor data:", error);
    alert("Error updating doctor data");
  }
  setIsFetching(false);
};

/* ---------------------------
   Utility: parse/format slot strings
   - Accepts:
     - "9am - 12pm" (string)
     - { timeInterval: "9am - 12pm", capacity: 20, isAvailable: true, _id: "..." }
     - or already { startingTime, endingTime, ... } objects
   - Returns unified object: { startingTime, endingTime, capacity, isAvailable, _id? }
   --------------------------- */
function parseSlot(raw) {
  if (!raw) return { startingTime: "", endingTime: "", capacity: 20, isAvailable: true };

  // If already in desired shape:
  if (raw.startingTime || raw.endingTime) {
    return {
      startingTime: raw.startingTime || "",
      endingTime: raw.endingTime || "",
      capacity: raw.capacity ?? 20,
      isAvailable: raw.isAvailable ?? true,
      _id: raw._id,
    };
  }

  // If object with timeInterval
  if (typeof raw === "object" && raw.timeInterval) {
    const parts = raw.timeInterval.split("-").map(s => s.trim());
    const start = parts[0] ?? "";
    const end = parts[1] ?? "";
    return {
      startingTime: start,
      endingTime: end,
      capacity: raw.capacity ?? 20,
      isAvailable: raw.isAvailable ?? true,
      _id: raw._id,
    };
  }

  // If plain string like "9am - 12pm"
  if (typeof raw === "string") {
    const parts = raw.split("-").map(s => s.trim());
    const start = parts[0] ?? "";
    const end = parts[1] ?? "";
    return { startingTime: start, endingTime: end, capacity: 20, isAvailable: true };
  }

  // Fallback
  return { startingTime: "", endingTime: "", capacity: 20, isAvailable: true };
}

/* Convert slot objects back to backend format (timeInterval string) */
function formatSlotForBackend(slot) {
  const start = (slot.startingTime || "").trim();
  const end = (slot.endingTime || "").trim();
  const timeInterval = start || end ? `${start} - ${end}` : "";
  // include _id and numeric capacity and isAvailable
  const out = {
    timeInterval,
    capacity: Number(slot.capacity ?? 20),
    isAvailable: !!slot.isAvailable,
  };
  if (slot._id) out._id = slot._id;
  return out;
}

/* ---------------------------
   Component
   --------------------------- */
export default function DoctorProfileChange() {
  const [doctorData, setDoctorData] = useState({
    qualifications: [],
    specializations: [],
    otherSpecialization: "",
    experience: "",
    description: "",
    gender: "",
    slots: [],
  });
  const [data, setData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();
  const { translatedTexts } = useContext(TranslationContext);

  const specializationsList = [
    "Cardiology",
    "Neurology",
    "Orthopedic Surgery",
    "Pediatrics",
    "Psychiatry",
    "Dermatology",
    "Internal Medicine",
    "Orthodontics",
  ];

  useEffect(() => {
    const AuthToken = localStorage.getItem("AuthToken");
    getDoctorData(AuthToken, setData, setIsFetching);
  }, []);

  useEffect(() => {
    // If server returned data, populate doctorData with safe defaults and parse slots
    if (data) {
      // Map slots returned by server (could be strings or objects) into {startingTime, endingTime, ...}
      const parsedSlots = Array.isArray(data.slots)
        ? data.slots.map(s => parseSlot(s))
        : [];

      setDoctorData(prev => ({
        ...prev,
        qualifications: Array.isArray(data.qualifications) ? data.qualifications : (data.qualifications ? [data.qualifications] : prev.qualifications),
        specializations: Array.isArray(data.specializations) ? data.specializations : (data.specializations ? [data.specializations] : prev.specializations),
        experience: data.experience ?? prev.experience,
        description: data.description ?? prev.description,
        gender: data.gender ?? prev.gender,
        slots: parsedSlots.length ? parsedSlots : prev.slots,
      }));
    }
  }, [data]);

  const handleSpecializationChange = (specialization) => {
    setDoctorData(prevData => {
      const updatedSpecializations = prevData.specializations.includes(specialization)
        ? prevData.specializations.filter(item => item !== specialization)
        : [...prevData.specializations, specialization];
      return { ...prevData, specializations: updatedSpecializations };
    });
  };

  const handleAddSlot = () => {
    setDoctorData(prevData => ({
      ...prevData,
      slots: [...prevData.slots, { startingTime: "", endingTime: "", isAvailable: true, capacity: 20 }],
    }));
  };

  const handleRemoveSlot = (index) => {
    setDoctorData(prevData => ({
      ...prevData,
      slots: prevData.slots.filter((_, i) => i !== index),
    }));
  };

  const handleSlotChange = (index, field, value) => {
    setDoctorData(prevData => {
      const updatedSlots = prevData.slots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot));
      return { ...prevData, slots: updatedSlots };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Merge otherSpecialization if present
    const updatedSpecializations = doctorData.otherSpecialization
      ? [...doctorData.specializations, doctorData.otherSpecialization]
      : doctorData.specializations;

    // Convert slots back to backend format (timeInterval strings)
    const slotsForBackend = (doctorData.slots || []).map(formatSlotForBackend);

    const updatedDoctorData = {
      qualifications: doctorData.qualifications,
      specializations: updatedSpecializations,
      experience: doctorData.experience,
      description: doctorData.description,
      gender: doctorData.gender,
      slots: slotsForBackend,
      otherSpecialization: "", // reset
    };

    await handleUpdateDoctor(localStorage.getItem("AuthToken"), updatedDoctorData, setIsFetching);

    navigate("/doctor-home");
  };

  return isFetching ? (
    <p>Loading...</p>
  ) : (
    <div className={classes.formcon}>
      <form className={classes.form} onSubmit={handleSubmit}>

        <h1 className={classes.title}>{translatedTexts["Doctor Profile Settings"] || "Doctor Profile Settings"}</h1>

        <label className={classes.label}>{translatedTexts["Qualification"] || "Qualification"}</label>
        <input
          className={classes.input}
          type="text"
          placeholder="Enter qualification..."
          value={doctorData.qualifications[0] || ""}
          onChange={(e) => setDoctorData({ ...doctorData, qualifications: [e.target.value] })}
        />

        <label className={classes.label}>{translatedTexts["Specialization"] || "Specialization"}</label>
        <div className={classes.specializationContainer}>
          {specializationsList.map((specialization, idx) => (
            <label key={idx} className={classes.specializationItem}>
              <input
                type="checkbox"
                checked={doctorData.specializations.includes(specialization)}
                onChange={() => handleSpecializationChange(specialization)}
              />
              <span style={{ marginLeft: 6 }}>{specialization}</span>
            </label>
          ))}
        </div>

        <label className={classes.label}>{translatedTexts["Other Specialization"] || "Other Specialization"}</label>
        <input
          className={classes.input}
          type="text"
          placeholder="Enter other specialization..."
          value={doctorData.otherSpecialization}
          onChange={(e) => setDoctorData({ ...doctorData, otherSpecialization: e.target.value })}
        />

        <label className={classes.label}>{translatedTexts["Experience"] || "Experience (in years)"}</label>
        <input
          className={classes.input}
          type="number"
          placeholder="Enter experience..."
          value={doctorData.experience}
          onChange={(e) => setDoctorData({ ...doctorData, experience: e.target.value })}
        />

        <label className={classes.label}>{translatedTexts["Description"] || "Description"}</label>
        <textarea
          className={classes.textarea}
          placeholder="Enter a brief description..."
          value={doctorData.description}
          onChange={(e) => setDoctorData({ ...doctorData, description: e.target.value })}
        />

        <label className={classes.label}>{translatedTexts["Gender"] || "Gender"}</label>
        <select
          className={classes.select}
          value={doctorData.gender}
          onChange={(e) => setDoctorData({ ...doctorData, gender: e.target.value })}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label className={classes.label}>{translatedTexts["Available Slots"] || "Available Slots"}</label>
        {doctorData.slots && doctorData.slots.length === 0 && (
          <p className={classes.small}>No slots defined. Add one below.</p>
        )}
        {doctorData.slots &&
          doctorData.slots.map((slot, index) => (
            <div key={slot._id ?? index} className={classes.slotContainer}>
              <input
                className={classes.input}
                type="text"
                placeholder="Starting time (e.g. 9am)"
                value={slot.startingTime}
                onChange={(e) => handleSlotChange(index, "startingTime", e.target.value)}
                required
              />
              <input
                className={classes.input}
                type="text"
                placeholder="Ending time (e.g. 12pm)"
                value={slot.endingTime}
                onChange={(e) => handleSlotChange(index, "endingTime", e.target.value)}
                required
              />
              <input
                className={classes.input}
                type="number"
                placeholder="Capacity"
                value={slot.capacity}
                onChange={(e) => handleSlotChange(index, "capacity", e.target.value)}
                required
              />
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={!!slot.isAvailable}
                  onChange={(e) => handleSlotChange(index, "isAvailable", e.target.checked)}
                />
                <span className={classes.small}>Available</span>
              </label>
              <button type="button" className={classes.removeButton} onClick={() => handleRemoveSlot(index)}>
                Remove Slot
              </button>
            </div>
          ))}

        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={handleAddSlot} className={classes.addButton}>
            {translatedTexts["Add Slot"] || "Add Slot"}
          </button>

          <button className={classes.button} type="submit">
            {translatedTexts["Submit"] || "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
