import React from 'react'
const LiveCall=()=>{
  window.location.assign(`/video-call`)
}
export default function SkinDoctors() {
  return (
    <div>
      <div className  = 'chat-box'>
        <button> Chat with us </button>
      </div>
      <button onClick={LiveCall}>Video Call</button>
    </div>
  )
}
