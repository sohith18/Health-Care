import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { useLocation } from "react-router-dom"
import { useState } from "react"
import NotificationHandler from "./components/Notification.jsx"

export default function RootLayout() {
  const loc = useLocation()
  console.log(loc.pathname)
  const path = loc.pathname

  return (
    <div>
      {path==='/login' || path==='/register' || path==='/video-call/meeting'? null:<Navbar />}
      <NotificationHandler />
      <Outlet />
    </div>
  )
}

