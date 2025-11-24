import React from "react"
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import classes from "../Styles/Login.module.css";
import image from "../assets/login.jpg";
import logo from "../assets/logo.png"; // Your logo image
import { TranslationContext } from "../store/TranslationContext";

export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: '',
        password: ''
    });

    const { translatedTexts } = useContext(TranslationContext);

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/auth/login", { 
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data), 
            });
            const userData = await response.json();
            if (response.ok) {
                localStorage.setItem('AuthToken', userData.token);
                // setToken(userData.token);
                // setUser(userData.user);
                console.log(userData.user.role)
                if(userData.user.role=="PATIENT"){
                    navigate('/');
                }
                else if(userData.user.role=="DOCTOR"){
                    if(userData.user.slots.length==0){
                        navigate('/profile-change-doctor')
                    }
                    else{
                        navigate('/doctor-home')
                    }
                }
                // window.location.reload()
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.left}>
                {/* Main image */}
                <img src={image} alt="Background" className={classes.img} />
                
                {/* Overlay button with the logo */}
                <button 
                    className={classes["button-overlay"]} 
                    onClick={() => navigate('/')}
                >
                    <img src={logo} alt="Logo" />
                </button>
            </div>
            <div className={classes.formcon}>
                <form onSubmit={loginUser} className={classes.form}>
                    <h2 className={classes.title}>{translatedTexts['Welcome Back'] || 'Welcome Back'}</h2>
                    <p className={classes.subtitle}>{translatedTexts['Please login to your account'] || 'Please login to your account'}</p>
                    <label className={classes.label}>{translatedTexts['Email'] || 'Email'}</label>
                    <input 
                        className={classes.input} 
                        type="email" 
                        placeholder="Enter email..." 
                        value={data.email} 
                        onChange={(e) => setData({ ...data, email: e.target.value })} 
                    />
                    <label className={classes.label}>{translatedTexts['Password'] || 'Password'}</label>
                    <input 
                        className={classes.input} 
                        type="password" 
                        placeholder="Enter password..." 
                        value={data.password} 
                        onChange={(e) => setData({ ...data, password: e.target.value })} 
                    />
                    <button type="submit" className={classes.button}>
                        {translatedTexts['Login'] || 'Login'}
                    </button>
                    <p className={classes.footer}>
                        {translatedTexts["Don't have an account?"] || "Don't have an account?"} 
                        <Link to="/register">{translatedTexts['Sign Up'] || 'Sign Up'}</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
