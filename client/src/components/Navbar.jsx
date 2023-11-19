import { useState } from 'react';
import {Link } from 'react-router-dom';

export default function Navbar() {
  const [displalog_out_name,setdisplalog_out_name] = useState(window.localStorage.getItem("user"));
  console.log(displalog_out_name);
  let loggedin = displalog_out_name?true:false;
  let val;
  if(!loggedin){
    val="/login";
  }
  else{
    val = "/video-call"
  }

  let login_details,log_out;

  if(!displalog_out_name){
    login_details =  <Link className="a-css" to ="/login">Login</Link>
  }
  else{
    login_details = <div className="a-css">
          {displalog_out_name}
        </div>
    log_out = <button className='nav-button' style={{fontSize:13}}  onClick={()=>{setdisplalog_out_name(window.localStorage.removeItem("user"))}}>Log Out</button>   
  }

  return (
    <nav className='nav-outer'>
      <div className='nav-bar'>
        <Link className="a-css" to ="/">Home</Link>
        <Link className="a-css" to="/medicines">Medicines</Link>
        <Link className="a-css" to={val}>Video Call</Link>
        {login_details}
        {log_out}
        
      </div> 
    </nav>
  )
}