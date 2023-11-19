import React from 'react'
const  LiveCall=()=>{
  const displalog_out_name = (window.localStorage.getItem("user"));
  console.log(displalog_out_name);
  let loggedin = displalog_out_name?true:false;
  if(!loggedin){
    window.location.assign(`/login`)
  }
  else{
    window.location.assign(`/video-call`)
  }
}
export default function DepressionDoctors() {
  return (
    <div>
      <div className  = 'chat-box'>
        <button> Chat with us </button>
      </div>
      <button onClick={LiveCall}>Video Call</button>
    </div>
  )
}
