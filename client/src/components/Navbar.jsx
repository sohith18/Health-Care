import {Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className='nav-outer'>
      <div className='nav-bar'>
        <Link className="a-css" to ="/">Home</Link>
        <Link className="a-css" to="/medicines">Medicines</Link>
        <Link className="a-css" to="/video-call">Video Call</Link>
        {window.localStorage.getItem("user")?
          window.localStorage.getItem("user")
        :
            <Link className="a-css" to ="/login">Login</Link>

        }
        <Link className="a-css" to ="/register">Register</Link>
        
      </div> 
    </nav>
  )
}