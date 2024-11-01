import { useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";
import classes from '../Styles/Register.module.css';
import imageDoc from '../assets/registerDoctor.jpg';
import imagePat from '../assets/registerPatient.jpg';

export default function Register() {
    const navigate = useNavigate();
    const [isdoctor, setisdoctor] = useState(false);
    const [data, setData] = useState({
        first_name: '',
        last_name: 'Dave',
        email: '',
        password: '',
        role: 'Human',
    });
    const registerUser = async (e) => {
        e.preventDefault();
        try {
            // console.log(userData);
            const response = await fetch("http://localhost:3000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            })
            const userData = await response.json();
            console.log(userData);
            alert(userData.msg);
            if (response.ok) {
                localStorage.setItem('AuthToken', userData.token);
                // setToken(userData.token);
                // setUser(userData.user);
                navigate('/');
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <div className={classes.container}>

            <div className={classes.left}>
                {isdoctor ? <img src={imageDoc} alt="Doctor" className={classes.img} />:<img src={imagePat} alt="Patient" className={classes.img} />}
                {/*<div className={classes.overlayText}>Where patients and doctors meet for better health outcomes. Log in to continue your journey.</div>*/}
            </div>
            <div className={classes.formcon}>
                <form onSubmit={registerUser} className={classes.form}>
                    <div className={classes.buttonContainer}>
                        <button type="button"  className={`${classes.roleButton} ${isdoctor ? classes.selected : ''}`} onClick={() => setisdoctor(true)}>Doctor</button>
                        <button type="button"  className={`${classes.roleButton} ${!isdoctor ? classes.selected : ''}`} onClick={() => setisdoctor(false)} >Patient</button>
                    </div>
                    <h2 className={classes.title}>Create Your Account</h2>
                    {isdoctor ? <p className={classes.subtitle}>Join our health platform and connect with patients</p>:<p className={classes.subtitle}>Start your health journey today</p>}
                    <label className={classes.label}> Name </label>
                    <input className={classes.input} type="text" placeholder='enter name ...' value={data.name} onChange={(e) => setData({ ...data, first_name: e.target.value })} />
                    <label className={classes.label}> Email </label>
                    <input className={classes.input} type="email" placeholder='enter email ...' value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                    <label className={classes.label}> Password </label>
                    <input className={classes.input} type="password" placeholder='enter password ...' value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
                    <button className={classes.button} type='submit'> Submit </button>
                    <p className={classes.footer}>Have an account? <Link to="/login">Sign In</Link> here.</p>

                </form>
            </div>



        </div>
    )
}
