import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '../assets/search.png';
import axios from 'axios';
import styles from '../Styles/DoctorSearch.module.css';
import backgroundImage from '../assets/searchDoctor6.jpg';
import DoctorsInfo from './DoctorsInfo';

const specialties = [
    'Eye Specialist',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedic Surgeon',
    'Psychiatrist',
];

const docData = [
    {
        id: 1,
        name: 'Dr. John Doe',
        education: ['MBBS', 'MD'],
        specializations: ['Cardiologist', 'Dentist'],
        experience: 5,
        availableTimes: ['10:00 AM', '11:00 AM', '12:00 PM'],
        description: 'Dr. John is a highly skilled Cardiologist with over 5 years of experience.',
        image: 'https://via.placeholder.com/150',
    },
    {
        id: 2,
        name: 'Dr. Jane Doe',
        education: ['MBBS', 'MD'],
        specializations: ['Dermatologist', 'ENT'],
        experience: 10,
        availableTimes: ['2:00 PM', '3:00 PM', '4:00 PM'],
        description: 'Dr. Jane specializes in Dermatology and ENT with 10 years of experience.',
        image: 'https://via.placeholder.com/150',
    },
];

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

    useEffect(() => {
        // Fetch doctors data when component mounts or search params change
        window.scrollTo(0, 0);
        async function fetchDoctors() {
            try {
                const response = await fetch("http://localhost:3000/doctor", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AuthToken}`,
                    },
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
        // Function to send filters can be implemented here
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.imageContainer}>
                <div className={styles.backgroundImage}></div>
                <div className={styles.searchBar}>
                    <input
                        placeholder="Search Doctors"
                        value={search.name}
                        onChange={(e) => setSearch({ ...search, name: e.target.value })}
                        className={styles.searchInput}
                    />
                    <img
                        src={SearchIcon}
                        alt="search"
                        className={styles.searchIcon}
                        onClick={handleSearch}
                    />
                </div>
            </div>
            <div className={styles.bar}>
            <h2 className={styles.filtersHeading}>Search By</h2>
            <div className={styles.filtersContainer}>
                
                <div className={styles.filter}>
                    <label>Gender</label>
                    <select
                        value={search.gender}
                        onChange={(e) => setSearch({ ...search, gender: e.target.value })}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className={styles.filter}>
                    <label>Experience</label>
                    <select
                        value={search.experience}
                        onChange={(e) => setSearch({ ...search, experience: e.target.value })}
                    >
                        <option value="">Select Experience</option>
                        <option value="1">1+ years</option>
                        <option value="5">5+ years</option>
                        <option value="10">10+ years</option>
                    </select>
                </div>
                <div className={styles.filter}>
                    <label>Specialization</label>
                    <select
                        value={search.specialization}
                        onChange={(e) => setSearch({ ...search, specialization: e.target.value })}
                    >
                        <option value="">Select Specialization</option>
                        {specialties.map((specialty, index) => (
                            <option key={index} value={specialty}>
                                {specialty}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            </div>
            <DoctorsInfo doctorsData={docData} />
        </div>
    );
}
