import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function NotificationHandler() {
  const navigate = useNavigate();

  const rejectCall = async (callId) => {
    // optional: clear any stale activeMeeting
    localStorage.removeItem('activeMeeting');

    fetch(`http://localhost:3000/heartbeat/reject/${callId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('AuthToken')}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

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
                  <p>
                    You have a meeting request, do you want to be redirected?
                  </p>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);

                      // cache active meeting so doctor can rejoin later
                      localStorage.setItem(
                        'activeMeeting',
                        JSON.stringify({
                          specialization: data.specialization,
                          callId: data.callId,
                        }),
                      );

                      navigate('/video-call/meeting', {
                        state: {
                          specialization: data.specialization,
                          create: false,
                          callId: data.callId,
                        },
                      });
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={async () => {
                      toast.dismiss(t.id);
                      await rejectCall(data.callId);
                    }}
                  >
                    No
                  </button>
                </div>
              ),
              {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                theme: 'light',
              },
            );
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return null; // no visible UI
}

export default NotificationHandler;
