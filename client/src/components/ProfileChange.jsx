import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react";
import classes from '../Styles/ProfileChange.module.css';
import { useContext } from "react";
import { TranslationContext } from "../store/TranslationContext";

async function getUserData(AuthToken,setData,setIsFetching) {
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

            if(response.ok) {
                setData({...data.user,'password':''});
                console.log(data);
            }else {
                
                console.log(data);
                setData(null);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
            setData(null);
        }
    }

    setIsFetching(false);
}


const handleUpdateUser = async (AuthToken, userData, setData, setIsFetching) => {

    console.log(AuthToken, userData)
    if (AuthToken) {
        try {
            setIsFetching(true);
            const response = await fetch("http://localhost:3000/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${AuthToken}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if(response.ok) {
                console.log(data);
                alert(data.msg);
                
            } else {
                console.log(data);
                alert(data.msg)
            }


        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    setIsFetching(false);
}

export default function ProfileChange() {
    const [data, setData] = useState({ name: '', password: '', re_password:'' });
    const [IsFetching,setIsFetching] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const {translatedTexts} = useContext(TranslationContext);

    
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form submission until validation passes
        if (data.password !== data.re_password) {
            setError('Passwords do not match.');
        } else {
            setError('');
            // Proceed with form submission or further processing
            await handleUpdateUser(localStorage.getItem('AuthToken'), data, setData, setIsFetching)
            console.log('Passwords match. Form submitted!');
            navigate('/');
        }
    };



    useEffect(() => {
        const AuthToken = localStorage.getItem('AuthToken');
        getUserData(AuthToken,setData,setIsFetching);
    }, []);

    console.log(data);
    return (
        IsFetching ? <p>Loading...</p> :
        <div onSubmit={handleSubmit} className={classes.formcon}>
            
                <form className={classes.form}>
                <h1 className={classes.title}> {translatedTexts['Profile Settings'] || 'Profile Settings'} </h1>
                <label className={classes.label}> { 'Name'} </label>
                <input className={classes.input} type="text" placeholder='enter name ...' value={data.name} onChange={(e) => setData({ ...data, first_name: e.target.value })} required/>
                <label className={classes.label}> {translatedTexts['New Password'] || 'New Password'} </label>
                <input className={classes.input} type="password" placeholder='enter password ...' value={data.password} 
                onChange={(e) => {
                    setError('')
                    setData({ ...data, password: e.target.value })
                }} required/>
                <label className={classes.label}> {translatedTexts['Re-enter Password'] || 'Re-enter Password'} </label>
                <input className={classes.input} type="password" placeholder='enter password ...' value={data.re_password} 
                onChange={(e) => {
                    setError('')
                    setData({ ...data, re_password: e.target.value })}}
                 required/>
                {error && <p className={classes.error}>{error}</p>}
                    <button className={classes.button} type='submit'> {translatedTexts['Submit'] || 'Submit'} </button>
            </form>
        </div>
    )
}
