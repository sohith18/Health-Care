import { useState } from "react";
import axios from 'axios';
import {toast} from "react-hot-toast";
import {useNavigate} from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: '',
        password: ''
    })
    
    const loginUser = async (e) => {
        e.preventDefault();
        const {email, password} = data;
        try {
            const {data} = await axios.post('/login', {
                email, password
            });
        if(data.error){
            toast.error(data.error);
        } else {
            window.localStorage.setItem("user",data)
            setData({});
            navigate('/');
        }
        } catch (error) {
            console.log(error);
        }
    }
  return (
        <div className="login-div">
        <form onSubmit={loginUser} className="login-form">
            <label className="label-css"> Email </label>
            <input className="input-css" type="email" placeholder='enter email ...' value={data.email} onChange={(e)=> setData({...data, email: e.target.value})}/>
            <label className="label-css"> Password </label>
            <input className="input-css" type="password" placeholder='enter password ...' value={data.password} onChange={(e)=> setData({...data, password: e.target.value})}/>
            <button type='submit'> Login </button>
        </form>
        </div>
  
  )
}
