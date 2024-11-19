import {
  Call,
  CallControls, CallingState, ParticipantView, SpeakerLayout, StreamCall, StreamTheme,
  StreamVideo, StreamVideoClient, useCall, useCallStateHooks
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';


export default function VideoCall() {
	const [meetDetails, setMeetDetails] = React.useState({});
	const [loading, setLoading] = React.useState(true)
	const navigate = useNavigate()
	const fetchMeetDetails = async (AuthToken) => {
    try {
        // console.log(userData);
        const response = await fetch("http://localhost:3000/meet", { 
            method: "GET", 
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AuthToken}`
            }
        })
        const meetData = await response.json();
        console.log("meetData: ", meetData);
        alert(meetData.msg);
		if (response.status == 401) {
			navigate('/')
			return;
		}
        if (response.ok) {
          setMeetDetails(meetData);
          setLoading(false)
        }
    } catch (error) {
        console.log(error);
    }
  }

  React.useEffect(() => {
    fetchMeetDetails(localStorage.getItem('AuthToken'));
  }, [])

  
  if (loading) {
    return <span>Loading...</span>
  }

  const user = {
    id: meetDetails.user._id,
    name: meetDetails.user.name,
    image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
  };

  const client = new StreamVideoClient({
      apiKey: meetDetails.apiKey,
      user: user,
      token: meetDetails.token
  });

  client.connectUser({
    id: user.id, 
    name: user.name,
    token: meetDetails.token, 
  })
  .then(() => {
    console.log("User connected successfully!");
  })
  .catch(error => {
    console.error("Failed to connect user:", error);
  });


  const call = client.call('default', meetDetails.callId);
  call.join({ create: true });


  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MyUILayout />
      </StreamCall>
    </StreamVideo>
  );
}

export const MyUILayout = () => {
  const call = useCall();
  const {
    useCameraState,
    useMicrophoneState,
    useCallCallingState,
    useParticipantCount,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const { camera } = useCameraState();
  const { microphone } = useMicrophoneState();

  

  if (callingState !== CallingState.JOINED) {
    if (callingState === CallingState.LEFT) {
      // handle extra logic of user leaving here
      if (camera) {
        camera
          .disable()
          .then(() => {
            console.log('Closed camera');
          })
          .catch((e) => {
            console.error('Error disabling camera:', e);
          });
      } else {
        console.warn('Camera object is not initialized.');
      }
  
      if (microphone) {
        microphone
          .disable()
          .then(() => {
            console.log('Closed audio');
          })
          .catch((e) => {
            console.error('Error disabling microphone:', e);
          });
      } else {
        console.warn('Microphone object is not initialized.');
      }
    }
    return <div>Loading...</div>;
  }
  
  

  return (
    <StreamTheme style={{ position: 'relative' }}>
      <SpeakerLayout participantsBarPosition='bottom' />
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
        width: '100vw'
      }}
    >
      {participants.map((index,participant) => (
        <div
        key={index}
          style={{ width: '100%', aspectRatio: '3 / 2' }}
        >
          <ParticipantView
            muteAudio
            participant={participant}
            key={participant.sessionId}
          ></ParticipantView>

        </div>
      ))}
    </div>
  )
}

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
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 10px 3px',
        borderRadius: '12px'
      }}
    >
      {participant && <ParticipantView muteAudio participant={participant} />}
    </div>
  )
}