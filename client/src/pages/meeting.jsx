import {
  Call,
  CallControls,
  CallingState,
  ParticipantView,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function VideoCall() {
  const [meetDetails, setMeetDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [client, setClient] = React.useState(null);
  const [callObj, setCallObj] = React.useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Prefer navigation state, but fall back to cached activeMeeting for doctor rejoin
  const stateData = location.state || {};
  const cachedMeeting =
    JSON.parse(localStorage.getItem('activeMeeting') || '{}') || {};

  const specialization =
    stateData.specialization || cachedMeeting.specialization;
  const create =
    typeof stateData.create === 'boolean' ? stateData.create : false;
  const callId = stateData.callId || cachedMeeting.callId;

  console.log('VideoCall init:', { stateData, cachedMeeting, specialization, callId });

  const fetchMeetDetails = async (AuthToken) => {
    try {
      // Guard: if we have neither specialization nor callId, do not hit backend
      if (!specialization && !callId) {
        console.error(
          'Missing specialization/callId for meeting, not calling /meet',
        );
        setMeetDetails(null);
        setLoading(false);
        return;
      }

      const url = `http://localhost:3000/meet/${specialization || 'none'}/${callId || 'none'}`;
      console.log('GET', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
      });
      const meetData = await response.json();
      console.log('meetData: ', response.status, meetData);

      if (response.status === 401) {
        navigate('/');
        return;
      }

      if (response.ok) {
        setMeetDetails(meetData);
      } else {
        alert(meetData.msg || 'Failed to get meeting details');
        setMeetDetails(null);
      }
    } catch (error) {
      console.error('Error fetching meet details:', error);
      setMeetDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of meeting details
  React.useEffect(() => {
    const AuthToken = localStorage.getItem('AuthToken');
    fetchMeetDetails(AuthToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup Stream client and join call
  React.useEffect(() => {
    let mounted = true;
    if (!meetDetails) return;

    // Cache active meeting for doctor so they can rejoin without notification
    if (
      meetDetails.role === 'doctor' &&
      specialization &&
      meetDetails.callId
    ) {
      console.log('Caching activeMeeting for doctor:', {
        specialization,
        callId: meetDetails.callId,
      });
      localStorage.setItem(
        'activeMeeting',
        JSON.stringify({
          specialization,
          callId: meetDetails.callId,
        }),
      );
    }

    if (
      !meetDetails.apiKey ||
      !meetDetails.token ||
      !meetDetails.user ||
      !meetDetails.callId
    ) {
      console.error('Missing meetDetails fields:', meetDetails);
      return;
    }

    const user = {
      id: meetDetails.user._id,
      name: meetDetails.user.name,
      image:
        meetDetails.user.profile_picture ||
        'https://getstream.io/random_svg/?id=oliver&name=Oliver',
    };

    const clientInstance = new StreamVideoClient({
      apiKey: meetDetails.apiKey,
      user,
      token: meetDetails.token,
      clockTolerance: 10,
    });

    (async () => {
      try {
        await clientInstance.connectUser({
          id: user.id,
          name: user.name,
          token: meetDetails.token,
        });
        if (!mounted) return;

        const call = clientInstance.call('default', meetDetails.callId);
        await call.join({ create: create });

        if (!mounted) {
          try {
            await call.leave();
          } catch (e) {}
          try {
            clientInstance.disconnect();
          } catch (e) {}
          return;
        }

        setClient(clientInstance);
        setCallObj(call);
      } catch (err) {
        console.error('Stream client/call error:', err);
        try {
          clientInstance.disconnect();
        } catch (e) {}
      }
    })();

    return () => {
      mounted = false;
      (async () => {
        try {
          if (callObj && callObj.leave) await callObj.leave();
        } catch (e) {}
        try {
          if (clientInstance && clientInstance.disconnect)
            await clientInstance.disconnect();
        } catch (e) {}
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, [meetDetails, specialization, create, callId]);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  if (!meetDetails) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>Unable to load meeting details.</p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '8px 12px', borderRadius: 6 }}
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  if (!client || !callObj) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div>Joining meeting...</div>
      </div>
    );
  }

  const role = meetDetails.role; // "doctor" | "patient"

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <StreamVideo client={client}>
        <StreamCall call={callObj}>
          <div
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <MyUILayout meeting_id={meetDetails.callId} role={role} />
          </div>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}

export const MyUILayout = ({ meeting_id, role }) => {
  const navigate = useNavigate();
  const call = useCall();
  const {
    useCameraState,
    useMicrophoneState,
    useCallCallingState,
    useParticipantCount,
    useParticipants,
    useLocalParticipant,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const { camera } = useCameraState();
  const { microphone } = useMicrophoneState();

  const isDoctor = role === 'doctor';

  const [endingForEveryone, setEndingForEveryone] = React.useState(false);
  const endingForEveryoneRef = React.useRef(false);

  React.useEffect(() => {
    endingForEveryoneRef.current = endingForEveryone;
  }, [endingForEveryone]);

  const [doctorDisconnected, setDoctorDisconnected] = React.useState(false);

  const deleteMeetDetails = async (AuthToken, id) => {
    try {
      const response = await fetch(`http://localhost:3000/meet/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
      });
      const data = await response.json();
      console.log('delete response:', data);
    } catch (error) {
      console.error('Error deleting meeting data:', error);
    }
  };

  // Patient waits when doctor disconnects; doctor auto-ends when patient leaves
  React.useEffect(() => {
    if (!localParticipant || !call) return;

    const remoteParticipants = participants.filter(
      (p) => p.sessionId !== localParticipant.sessionId,
    );

    if (!isDoctor) {
      if (
        remoteParticipants.length === 0 &&
        callingState === CallingState.JOINED
      ) {
        setDoctorDisconnected(true);
      } else {
        setDoctorDisconnected(false);
      }
    } else {
      if (
        remoteParticipants.length === 0 &&
        callingState === CallingState.JOINED &&
        participantCount === 1 &&
        !endingForEveryoneRef.current
      ) {
        setEndingForEveryone(true);
        (async () => {
          try {
            await call.endCall();
          } catch (e) {
            console.error('Failed to end call after patient left', e);
          }
        })();
      }
    }
  }, [
    participants,
    localParticipant,
    callingState,
    isDoctor,
    call,
    participantCount,
  ]);

  // When local user leaves
  React.useEffect(() => {
    if (callingState === CallingState.LEFT) {
      (async () => {
        try {
          if (camera) await camera.disable();
        } catch (e) {
          console.warn('camera disable error', e);
        }
        try {
          if (microphone) await microphone.disable();
        } catch (e) {
          console.warn('mic disable error', e);
        }

        const token = localStorage.getItem('AuthToken');

        // Delete meeting + clear cache when:
        // - patient leaves, OR
        // - doctor explicitly ended meeting
        if (!isDoctor || endingForEveryoneRef.current) {
          await deleteMeetDetails(token, meeting_id);
          localStorage.removeItem('activeMeeting');
        }

        navigate('/');
        window.location.reload();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callingState, camera, microphone, isDoctor, meeting_id]);

  const handleDoctorEndMeeting = React.useCallback(() => {
    if (!call) return;
    setEndingForEveryone(true);
    (async () => {
      try {
        await call.endCall();
      } catch (e) {
        console.error('Error ending call for everyone', e);
      }
    })();
  }, [call]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>Connecting to meeting...</div>
      </div>
    );
  }

  return (
    <StreamTheme
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {!isDoctor && doctorDisconnected && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            zIndex: 20,
          }}
        >
          Doctor disconnected, please stay in the call while they reconnect.
        </div>
      )}

      {isDoctor && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 20,
          }}
        >
          <button
            onClick={handleDoctorEndMeeting}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              backgroundColor: '#d32f2f',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            End meeting
          </button>
        </div>
      )}

      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};

export const MyParticipantList = (props) => {
  const { participants } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        width: '100vw',
      }}
    >
      {participants.map((participant) => (
        <div
          key={participant.sessionId}
          style={{ width: '100%', aspectRatio: '3 / 2' }}
        >
          <ParticipantView muteAudio participant={participant} />
        </div>
      ))}
    </div>
  );
};

export const MyFloatingLocalParticipant = (props) => {
  const { participant } = props;
  return (
    <div
      style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        width: '240px',
        height: '135px',
        boxShadow: 'rgba(0,0,0,0.1) 0px 0px 10px 3px',
        borderRadius: '12px',
      }}
    >
      {participant && <ParticipantView muteAudio participant={participant} />}
    </div>
  );
};
