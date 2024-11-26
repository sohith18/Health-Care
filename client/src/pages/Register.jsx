import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classes from "../Styles/Register.module.css";
import imageDoc from "../assets/registerDoctor.jpg";
import imagePat from "../assets/registerPatient.jpg";
import logo from "../assets/logo.png"; // Your logo image
import { TranslationContext } from "../store/TranslationContext";

export default function Register() {
    const navigate = useNavigate();
    const [isdoctor, setisdoctor] = useState(false);
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'PATIENT',
    });

    const { translatedTexts } = useContext(TranslationContext);

    const registerUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            });
            const userData = await response.json();
            alert(userData.msg);
            if (response.ok) {
                localStorage.setItem('AuthToken', userData.token);
                // setToken(userData.token);
                // setUser(userData.user);
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
                // window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={classes.container}>
            {/* Left image section */}
            <div className={classes.left}>
                {/* Display image based on role */}
                {isdoctor ? (
                    <img src={imageDoc} alt="Doctor" className={classes.img} />
                ) : (
                    <img src={imagePat} alt="Patient" className={classes.img} />
                )}

                {/* Overlay button with the logo */}
                <button 
                    className={classes["button-overlay"]} 
                    onClick={() => navigate('/')}
                >
                    <img src={logo} alt="Logo" />
                </button>
            </div>

            {/* Form section */}
            <div className={classes.formcon}>
                <form onSubmit={registerUser} className={classes.form}>
                    <div className={classes.buttonContainer}>
                        <button 
                            type="button" 
                            className={`${classes.roleButton} ${isdoctor ? classes.selected : ''}`} 
                            onClick={() => { 
                                setisdoctor(true); 
                                setData({ ...data, role: "DOCTOR" }); 
                            }}
                        >
                            {translatedTexts['Doctor'] || 'Doctor'}
                        </button>
                        <button 
                            type="button"  
                            className={`${classes.roleButton} ${!isdoctor ? classes.selected : ''}`} 
                            onClick={() => { 
                                setisdoctor(false); 
                                setData({ ...data, role: "PATIENT" }); 
                            }}
                        >
                            {translatedTexts['Patient'] || 'Patient'}
                        </button>
                    </div>
                    <h2 className={classes.title}>
                        {translatedTexts['Create Your Account'] || 'Create Your Account'}
                    </h2>
                    {isdoctor ? (
                        <p className={classes.subtitle}>
                            {translatedTexts['Join our health platform and connect with patients'] || 'Join our health platform and connect with patients'}
                        </p>
                    ) : (
                        <p className={classes.subtitle}>
                            {translatedTexts['Start your health journey today'] || 'Start your health journey today'}
                        </p>
                    )}
                    <label className={classes.label}>Name</label>
                    <input 
                        className={classes.input} 
                        required 
                        type="text" 
                        placeholder="Enter name..." 
                        value={data.name} 
                        onChange={(e) => setData({ ...data, name: e.target.value })} 
                    />
                    <label className={classes.label}>
                        {translatedTexts['Email'] || 'Email'}
                    </label>
                    <input 
                        className={classes.input} 
                        required 
                        type="email" 
                        placeholder="Enter email..." 
                        value={data.email} 
                        onChange={(e) => setData({ ...data, email: e.target.value })} 
                    />
                    <label className={classes.label}>
                        {translatedTexts['Password'] || 'Password'}
                    </label>
                    <input 
                        className={classes.input} 
                        required 
                        type="password" 
                        placeholder="Enter password..." 
                        value={data.password} 
                        onChange={(e) => setData({ ...data, password: e.target.value })} 
                    />
                    <button className={classes.button} type="submit">
                        {translatedTexts['Submit'] || 'Submit'}
                    </button>
                    <p className={classes.footer}>
                        {translatedTexts['Have an account?'] || 'Have an account?'} 
                        <Link to="/login">
                            {translatedTexts['Sign In'] || 'Sign In'}
                        </Link> 
                        {translatedTexts['here.'] || 'here.'}
                    </p>
                </form>
            </div>
        </div>
    );
}
