import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { useLocation } from "react-router-dom"
import { useState } from "react"

export default function RootLayout() {
  const loc = useLocation()
  console.log(loc.pathname)
  const path = loc.pathname

  return (
    <div>
      {path==='/login' || path==='/register'? null:<Navbar />}
      <Outlet />
    </div>
  )
}

