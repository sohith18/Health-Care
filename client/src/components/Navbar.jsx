import {Link } from 'react-router-dom';

export default function Navbar() {
  let display_name = window.localStorage.getItem("user");
  let loggedin = display_name?true:false;
  let val;
  if(!loggedin){
    val="/login";
  }
  else{
    val = "/video-call"
  }

  let x;

  if(!display_name){
    x =  <Link className="a-css" to ="/login">Login</Link>
  }
  else{
    x = <div className="a-css">{display_name}</div>
  }

  return (
    <nav className='nav-outer'>
      <div className='nav-bar'>
        <Link className="a-css" to ="/">Home</Link>
        <Link className="a-css" to="/medicines">Medicines</Link>
        <Link className="a-css" to={val}>Video Call</Link>
        {x}
        
      </div> 
    </nav>
  )
}