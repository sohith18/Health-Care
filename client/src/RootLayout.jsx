import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import DoctorNotificationFab from "./components/DoctorNotificationFab";

export default function RootLayout() {
  const loc = useLocation();
  const path = loc.pathname;

  const hideChrome =
    path === "/login" ||
    path === "/register" ||
    path.startsWith("/video-call/meeting");

  return (
    <div>
      {!hideChrome && <Navbar />}
      <Outlet />
      {/* FAB only renders for DOCTOR internally and hides on meeting/login/register */}
      {!hideChrome && <DoctorNotificationFab />}
    </div>
  );
}
