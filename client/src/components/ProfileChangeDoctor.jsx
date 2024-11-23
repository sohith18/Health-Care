import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import classes from '../Styles/ProfileChange.module.css';
import { useContext } from "react";
import { TranslationContext } from "../store/TranslationContext";

async function getDoctorData(AuthToken, setData, setIsFetching) {
    if (AuthToken) {
        try {
            setIsFetching(true);
            const response = await fetch("http://localhost:3000/user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AuthToken}`
                },
            });

            const data = await response.json();

            if (response.ok) {
                setData(data.user);
                console.log(data);
            } else {
                console.log(data);
                setData(null);
            }

        } catch (error) {
            console.error('Error fetching doctor data:', error);
            setData(null);
        }
    }

    setIsFetching(false);
}

const handleUpdateDoctor = async (AuthToken, userData, setIsFetching) => {
    console.log(AuthToken, userData);
    if (AuthToken) {
        try {
            setIsFetching(true);
            const response = await fetch("http://localhost:3000/doctor", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AuthToken}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data);
                alert(data.msg);
            } else {
                console.log(data);
                alert(data.msg);
            }

        } catch (error) {
            console.error('Error updating doctor data:', error);
        }
    }
    setIsFetching(false);
}

export default function DoctorProfileChange() {
    const [doctorData, setDoctorData] = useState({ qualification: '', specialization: '', experience: '', description: '', gender: '', slots: [] });
    const [data,setData]=useState();
    const [isFetching, setIsFetching] = useState(false);
    // const [isLoading,setIsLoading]= useState(true);
    const navigate = useNavigate();
    const { translatedTexts } = useContext(TranslationContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(doctorData)
        await handleUpdateDoctor(localStorage.getItem('AuthToken'), doctorData, setDoctorData, setIsFetching);
        console.log('Form submitted!');
        navigate('/doctor-home');
    };

    const handleAddSlot = () => {
        console.log(doctorData,"hii");
        setDoctorData(prevData => ({
            ...prevData,
            slots: [...prevData.slots, { startingTime: '', endingTime: '', isAvailable: true, capacity:20 }]
        }));
    };

    const handleSlotChange = (index, field, value) => {
        const updatedSlots = doctorData.slots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        setDoctorData({ ...doctorData, slots: updatedSlots });
    };

    useEffect(() => {
        const AuthToken = localStorage.getItem('AuthToken');
        getDoctorData(AuthToken, setData, setIsFetching);
    }, []);

    console.log(data);
    return (
        isFetching ? <p>Loading...</p> :
        <div onSubmit={handleSubmit} className={classes.formcon}>
            <form className={classes.form}>
                <h1 className={classes.title}>{translatedTexts['Doctor Profile Settings'] || 'Doctor Profile Settings'}</h1>
                
                <label className={classes.label}>{translatedTexts['Qualification'] || 'Qualification'}</label>
                <input className={classes.input} type="text" placeholder='Enter qualification...' value={doctorData.qualification}
                    onChange={(e) => setDoctorData({ ...doctorData, qualification: e.target.value })}  />

                <label className={classes.label}>{translatedTexts['Specialization'] || 'Specialization'}</label>
                <input className={classes.input} type="text" placeholder='Enter specialization...' value={doctorData.specialization}
                    onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}  />

                <label className={classes.label}>{translatedTexts['Experience'] || 'Experience (in years)'}</label>
                <input className={classes.input} type="number" placeholder='Enter experience...' value={doctorData.experience}
                    onChange={(e) => setDoctorData({ ...doctorData, experience: e.target.value })}  />

                <label className={classes.label}>{translatedTexts['Description'] || 'Description'}</label>
                <textarea className={classes.textarea} placeholder='Enter a brief description...' value={doctorData.description}
                    onChange={(e) => setDoctorData({ ...doctorData, description: e.target.value })}  />

                <label className={classes.label}>{translatedTexts['Gender'] || 'Gender'}</label>
                <select className={classes.select} value={doctorData.gender}
                    onChange={(e) => setDoctorData({ ...doctorData, gender: e.target.value })}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>

                <label className={classes.label}>{translatedTexts['Available Slots'] || 'Available Slots'}</label>
                {doctorData.slots && doctorData.slots.map((slot, index) => (
                    <div key={index} className={classes.slotContainer}>
                        <input
                            className={classes.input}
                            type="text"
                            placeholder='Starting time (e.g. 9am)'
                            value={slot.startingTime}
                            onChange={(e) => handleSlotChange(index, 'startingTime', e.target.value)}
                            required
                        />
                        <input
                            className={classes.input}
                            type="text"
                            placeholder='Ending time (e.g. 12pm)'
                            value={slot.endingTime}
                            onChange={(e) => handleSlotChange(index, 'endingTime', e.target.value)}
                            required
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={slot.isAvailable}
                                onChange={(e) => handleSlotChange(index, 'isAvailable', e.target.checked)}
                            />
                            Available
                        </label>
                    </div>
                ))}
                <button type="button" onClick={handleAddSlot} className={classes.addButton}>
                    {translatedTexts['Add Slot'] || 'Add Slot'}
                </button>
                
                <button className={classes.button} type='submit'>{translatedTexts['Submit'] || 'Submit'}</button>
            </form>
        </div>
    )
}
