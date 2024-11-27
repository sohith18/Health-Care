import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function NotificationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:3000/heartbeat', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('AuthToken')}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Fetched data:', data);

          if (data.token) {
            toast.info(
              (t) => (
                <div>
                  <p>You have a meeting request, do you want to be redirected?</p>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate('/video-call/meeting', {
                        state: { specialization: data.specialization, create: false, callId: data.callId },
                      });
                    }}
                  >
                    Yes
                  </button>
                  <button onClick={() => toast.dismiss(t.id)}>No</button>
                </div>
              ),
                { 
                    position: "bottom-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    theme: "light",
              }
            );
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [navigate]);

  return null; // This component doesn't render anything visible
}

export default NotificationHandler;
