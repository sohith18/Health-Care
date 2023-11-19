import React from 'react'
const LiveCall=()=>{
  window.location.assign(`/video-call`)
}
const Chat=()=>{
  window.location.assign(`/chatbot`)
}
export default function DepressionDoctors() {
  return (
    <div>
      <div className  = 'chat-box'>
        <button onClick={Chat}> Chat with us </button>
      </div>
      <button onClick={LiveCall}>Video Call</button>
    </div>
  )
}
