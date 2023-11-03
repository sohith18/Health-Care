import { useState } from "react";
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const registerUser = async (e) => {
        e.preventDefault();
        const {name, email, password} = data;
        try {
            const {data} = await axios.post('/register', {
            name, email, password
        });
        if(data.error){
            toast.error(data.error);
        } else{
            setData({});
            console.log("Success");
            toast.success("Login Successfull");
            navigate('/login');
         }
        } catch (error) {
            console.log(error);
        }
    }
  return (
    <div className="register-div">
        <form onSubmit={registerUser} className="register-form"> 
            <label className="label-css"> Name </label>
            <input className="input-css" type="text" placeholder='enter name ...' value={data.name} onChange={(e)=> setData({...data, name: e.target.value})}/>
            <label className="label-css"> Email </label>
            <input className="input-css" type="email" placeholder='enter email ...' value={data.email} onChange={(e)=> setData({...data, email: e.target.value})}/>
            <label className="label-css"> Password </label>
            <input className="input-css" type="password" placeholder='enter password ...' value={data.password} onChange={(e)=> setData({...data, password: e.target.value})}/>
            <button type='submit'> Submit </button>

        </form>
        
        
        
    </div>
  )
}
