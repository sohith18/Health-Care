import { useState } from "react";
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
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
    <div className="register-div">
        <form onSubmit={registerUser} className="register-form"> 
            <label className="label-css"> Name </label>
            <input className="input-css" type="text" placeholder='enter name ...' value={data.name} onChange={(e)=> setData({...data, first_name: e.target.value})}/>
            <label className="label-css"> Email </label>
            <input className="input-css" type="email" placeholder='enter email ...' value={data.email} onChange={(e)=> setData({...data, email: e.target.value})}/>
            <label className="label-css"> Password </label>
            <input className="input-css" type="password" placeholder='enter password ...' value={data.password} onChange={(e)=> setData({...data, password: e.target.value})}/>
            <button type='submit'> Submit </button>

        </form>
        
        
        
    </div>
  )
}
