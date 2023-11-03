import {Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <div className='navbar'>
        <Link to ="/">Home</Link>
        <Link to="/medicines">Medicines</Link>
        <Link to="/video-call">Video Consult</Link>
        <Link to ="/login">Login</Link>
        <Link to ="/register">Register</Link>
        
      </div> 
    </nav>
  )
}
