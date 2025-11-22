import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../Styles/DoctorNotificationFab.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

/**
 * Floating notification button for DOCTOR role only.
 * Polls /heartbeat and lets doctor join or reject the meeting.
 */
const DoctorNotificationFab = () => {
  const [isDoctor, setIsDoctor] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  const [notif, setNotif] = useState({
    hasMeeting: false,
    callId: null,
    specialization: null,
  });

  const [panelOpen, setPanelOpen] = useState(false); // for both meeting + info popup

  const navigate = useNavigate();
  const location = useLocation();

  const AuthToken = localStorage.getItem("AuthToken");

  const fabRef = useRef(null);
  const popupRef = useRef(null);

  // 1) Detect role so we only show for doctors
  useEffect(() => {
    if (!AuthToken) {
      setIsDoctor(false);
      setLoadingRole(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const resp = await fetch("http://localhost:3000/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthToken}`,
          },
        });
        const data = await resp.json();
        if (resp.ok && data.user && data.user.role === "DOCTOR") {
          setIsDoctor(true);
        } else {
          setIsDoctor(false);
        }
      } catch (e) {
        console.error("DoctorNotificationFab user fetch error:", e);
        setIsDoctor(false);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUser();
  }, [AuthToken]);

  // 2) Poll /heartbeat when doctor is logged in
  useEffect(() => {
    if (!isDoctor || !AuthToken) return;

    const poll = async () => {
      try {
        const response = await fetch("http://localhost:3000/heartbeat", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthToken}`,
          },
        });

        const data = await response.json();
        console.log("Doctor FAB heartbeat:", data);

        if (response.ok && data.token && data.callId) {
          setNotif({
            hasMeeting: true,
            callId: data.callId,
            specialization: data.specialization,
          });
        } else {
          setNotif({
            hasMeeting: false,
            callId: null,
            specialization: null,
          });
          setPanelOpen(false);
        }
      } catch (error) {
        console.error("Doctor FAB heartbeat error:", error);
      }
    };

    // initial
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [isDoctor, AuthToken]);

  // 3) Close popup when clicking outside (fab or popup)
  useEffect(() => {
    if (!panelOpen) return;

    const handleClickOutside = (event) => {
      const popupEl = popupRef.current;
      const fabEl = fabRef.current;

      if (
        popupEl &&
        !popupEl.contains(event.target) &&
        fabEl &&
        !fabEl.contains(event.target)
      ) {
        setPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [panelOpen]);

  // 4) Reject meeting
  const rejectCall = async () => {
    if (!notif.callId || !AuthToken) return;

    try {
      localStorage.removeItem("activeMeeting");

      const resp = await fetch(
        `http://localhost:3000/heartbeat/reject/${notif.callId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AuthToken}`,
          },
        },
      );
      const data = await resp.json();
      console.log("Reject heartbeat:", data);
    } catch (e) {
      console.error("Reject heartbeat error:", e);
    } finally {
      setNotif({
        hasMeeting: false,
        callId: null,
        specialization: null,
      });
      setPanelOpen(false);
    }
  };

  // 5) Join meeting
  const joinCall = () => {
    if (!notif.callId || !notif.specialization) return;

    localStorage.setItem(
      "activeMeeting",
      JSON.stringify({
        specialization: notif.specialization,
        callId: notif.callId,
      }),
    );

    setPanelOpen(false);

    navigate(
      `/video-call/meeting/${notif.specialization}/${notif.callId}`,
      {
        state: {
          specialization: notif.specialization,
          create: false,
          callId: notif.callId,
        },
      },
    );
  };

  // 6) Hide FAB on login/register/meeting routes
  const hideOnPaths = ["/login", "/register"];
  const isMeetingRoute = location.pathname.startsWith("/video-call/meeting");
  const shouldHide =
    hideOnPaths.includes(location.pathname) || isMeetingRoute;

  if (loadingRole || !isDoctor || shouldHide) {
    return null;
  }

  const handleFabClick = () => {
    // clicking icon toggles panel in both cases
    setPanelOpen((prev) => !prev || !notif.hasMeeting);
  };

  return (
    <>
      {/* Meeting popup */}
      {notif.hasMeeting && panelOpen && (
        <div
          ref={popupRef}
          className={styles.popupCard}
          onClick={(e) => e.stopPropagation()}
        >
          <p className={styles.popupText}>
            You have a meeting request. Join now?
          </p>
          <div className={styles.popupActions}>
            <button
              type="button"
              className={styles.popupYes}
              onClick={joinCall}
            >
              Yes
            </button>
            <button
              type="button"
              className={styles.popupNo}
              onClick={rejectCall}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Info popup when no notifications */}
      {!notif.hasMeeting && panelOpen && (
        <div
          ref={popupRef}
          className={styles.popupCard}
          onClick={(e) => e.stopPropagation()}
        >
          <p className={styles.popupText}>No new notifications.</p>
        </div>
      )}

      <button
        type="button"
        ref={fabRef}
        className={`${styles.fab} ${
          notif.hasMeeting ? styles.fabActive : ""
        }`}
        onClick={handleFabClick}
        aria-label="Doctor notifications"
      >
        <FontAwesomeIcon icon={faBell} style={{ color: "#ffffff" }} />
        {notif.hasMeeting && <span className={styles.badge}>1</span>}
      </button>
    </>
  );
};

export default DoctorNotificationFab;
