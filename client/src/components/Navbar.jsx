import { useState } from 'react';
import {Link } from 'react-router-dom';
import classes from '../Styles/Navbar.module.css';


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
    login_details =  <Link to ="/login">Login</Link>
  }
  else{
    login_details = 
      <div className="a-css">
          {displalog_out_name}
      </div>
    log_out = 
    <button className='nav-button' style={{fontSize:13}}  onClick={()=>{setdisplalog_out_name(window.localStorage.removeItem("user"))
    window.location.assign(`/`)}}>Log Out
    </button>   
  }

  return (
    <nav className={classes.outer}>
      <div className={classes.bar}>
        <Link to ="/">Home</Link>
        <Link to="/medicines">Medicines</Link>
        <Link to={val}>Video Call</Link>
        {/* <Link className="a-css" to="/chatbot">Chatbot</Link> */}
        {login_details}
        {log_out}
        
      </div> 
    </nav>
  )
}