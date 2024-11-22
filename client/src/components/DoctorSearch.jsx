import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '../assets/search.png';
import styles from '../Styles/DoctorSearch.module.css';
import DoctorsInfo from './DoctorsInfo';
import { TranslationContext } from "../store/TranslationContext"; // Import TranslationContext

const specialties = [
    "Cardiology", 
    "Neurology", 
    "Orthopedic Surgery", 
    "Pediatrics", 
    "Psychiatry", 
    "Dermatology", 
    "Internal Medicine", 
    "Orthodontics"
]

export default function DoctorSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [doctorsData, setDoctorsData] = useState([]);
    const [search, setSearch] = useState({
        name: searchParams.get('name') || '',
        gender: searchParams.get('gender') || '',
        experience: searchParams.get('experience') || '',
        specialization: searchParams.get('specialization') || '',
    });
    const navigate = useNavigate();
    const AuthToken = localStorage.getItem('AuthToken');
    const { translatedTexts } = useContext(TranslationContext); // Using translation context

    useEffect(() => {
        // Fetch doctors data when component mounts or search params change
        window.scrollTo(0, 0);
        async function fetchDoctors() {
            try {
                const response = await fetch("http://localhost:3000/doctor", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AuthToken}`,
                    },
                    body: JSON.stringify(search),
                });
                const data = await response.json(); 
                if (response.status === 200) {
                    console.log(data.doctors);
                    setDoctorsData(data.doctors);
                }
            } catch (error) {
                console.error("Error fetching doctors data:", error);
            }
        }
        fetchDoctors();
        
    }, [searchParams, AuthToken]);

    const handleSearch = () => {
        // Construct search params without updating on every keystroke
        const params = {
            ...(search.name && { name: search.name }),
            ...(search.gender && { gender: search.gender }),
            ...(search.experience && { experience: search.experience }),
            ...(search.specialization && { specialization: search.specialization }),
        };
        setSearchParams(params);
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.imageContainer}>
                <div className={styles.backgroundImage}></div>
                <div className={styles.searchBar}>
                    <input
                        placeholder={translatedTexts["Search Doctors"] || "Search Doctors"}
                        value={search.name}
                        onChange={(e) => setSearch({ ...search, name: e.target.value })}
                        className={styles.searchInput}
                    />
                    <img
                        src={SearchIcon}
                        alt={translatedTexts["Search"] || "search"}
                        className={styles.searchIcon}
                        onClick={handleSearch}
                    />
                </div>
            </div>
            <div className={styles.bar}>
                <h2 className={styles.filtersHeading}>{translatedTexts["Search By"] || "Search By"}</h2>
                <div className={styles.filtersContainer}>
                    <div className={styles.filter}>
                        <label>{translatedTexts["Gender"] || "Gender"}</label>
                        <select
                            value={search.gender}
                            onChange={(e) => setSearch({ ...search, gender: e.target.value })}
                        >
                            <option value="">{translatedTexts["Select Gender"] || "Select Gender"}</option>
                            <option value="Male">{translatedTexts["Male"] || "Male"}</option>
                            <option value="Female">{translatedTexts["Female"] || "Female"}</option>
                        </select>
                    </div>
                    <div className={styles.filter}>
                        <label>{translatedTexts["Experience"] || "Experience"}</label>
                        <select
                            value={search.experience}
                            onChange={(e) => setSearch({ ...search, experience: e.target.value })}
                        >
                            <option value="">{translatedTexts["Select Experience"] || "Select Experience"}</option>
                            <option value="1">{translatedTexts["1+ years"] || "1+ years"}</option>
                            <option value="5">{translatedTexts["5+ years"] || "5+ years"}</option>
                            <option value="10">{translatedTexts["10+ years"] || "10+ years"}</option>
                        </select>
                    </div>
                    <div className={styles.filter}>
                        <label>{translatedTexts["Specialization"] || "Specialization"}</label>
                        <select
                            value={search.specialization}
                            onChange={(e) => setSearch({ ...search, specialization: e.target.value })}
                        >
                            <option value="">{translatedTexts["Select Specialization"] || "Select Specialization"}</option>
                            {specialties.map((specialty, index) => (
                                <option key={index} value={specialty}>
                                    {translatedTexts[specialty] || specialty}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            {doctorsData ? <DoctorsInfo doctorsData={doctorsData} /> : <p>{translatedTexts["Loading..."] || "Loading..."}</p>}
        </div>
    );
}
