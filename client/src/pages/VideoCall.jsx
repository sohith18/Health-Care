import React, { useState } from 'react'
import {Routes, Route, Link} from 'react-router-dom';
import Doctors from './Doctors';

export default function VideoCall() {
  const [open,setOpen] = useState(false)
  const handleClick = ()=>{
    
  }
  return (
    <>
      <div>
    
      <Link to="/video-call/doctors">Consult Now</Link>
      </div>
    </>
  )
}
