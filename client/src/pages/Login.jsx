import { useContext, useState } from "react";
import axios from 'axios';
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import {Link } from 'react-router-dom';
import classes from '../Styles/Login.module.css';
import image from '../assets/login.jpg';
import { TranslationContext } from '../store/TranslationContext';

export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: '',
        password: ''
    })

    const {translatedTexts} = useContext(TranslationContext);

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            // console.log(userData);
            const response = await fetch("http://localhost:3000/auth/login", { 
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
                if(userData.user.role=="PATIENT"){
                navigate('/');
                }
                else if(userData.user.role=="DOCTOR"){
                    navigate('/doctor-home')
                }
                // window.location.reload()
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <div className={classes.container}>
                <div className={classes.left}>
                    <img src={image} alt="Hero" className={classes.img} />
                    {/*<div className={classes.overlayText}>Where patients and doctors meet for better health outcomes. Log in to continue your journey.</div>*/}
                </div>
                <div className={classes.formcon}>
                    
                    <form onSubmit={loginUser} className={classes.form}>
                        <h2 className={classes.title}>{translatedTexts['Welcome Back'] || 'Welcome Back'}</h2>
                        <p className={classes.subtitle}>{translatedTexts['Please login to your account'] || 'Please login to your account'}</p>
                        <label className={classes.label}>{translatedTexts['Email'] || 'Email'} </label>
                        <input className={classes.input} type="email" placeholder='enter email ...' value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                        <label className={classes.label}> {translatedTexts['Password'] || 'Password'} </label>
                        <input className={classes.input} type="password" placeholder='enter password ...' value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
                        <button type='submit' className={classes.button}>{translatedTexts['Login'] || 'Login'}</button>
                        <p className={classes.footer}>{translatedTexts['Don\'t have an account?'] || 'Don\'t have an account?'}<Link to ="/register">{translatedTexts['Sign Up'] || 'Sign Up'}</Link></p>
                        
                    </form>

                </div>
                
            </div>
        </>

    )
}
