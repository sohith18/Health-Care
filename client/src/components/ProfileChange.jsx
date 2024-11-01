import { Link} from "react-router-dom"
import { useState, useEffect, useRef } from "react";
import classes from '../Styles/ProfileChange.module.css';

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


export default function ProfileChange() {
    const [data, setData] = useState({ first_name: '', password: '', re_password:'' });
    const [IsFetching,setIsFetching] = useState(false);
    const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission until validation passes
    if (data.password !== data.re_password) {
      setError('Passwords do not match.');
    } else {
      setError('');
      // Proceed with form submission or further processing
      console.log('Passwords match. Form submitted!');
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
            
             <form  className={classes.form}>
                <h1 className={classes.title}> Profile Settings </h1>
                <label className={classes.label}> Name </label>
                <input className={classes.input} type="text" placeholder='enter name ...' value={data.first_name} onChange={(e) => setData({ ...data, first_name: e.target.value })} required/>
                <label className={classes.label}> New Password </label>
                <input className={classes.input} type="password" placeholder='enter password ...' value={data.password} 
                onChange={(e) => {
                    setError('')
                    setData({ ...data, password: e.target.value })
                }} required/>
                <label className={classes.label}> Re-enter Password </label>
                <input className={classes.input} type="password" placeholder='enter password ...' value={data.re_password} 
                onChange={(e) => {
                    setError('')
                    setData({ ...data, re_password: e.target.value })}}
                 required/>
                {error && <p className={classes.error}>{error}</p>}
                <button className={classes.button} type='submit'> Submit </button>
            </form>
        </div>
    )
}
