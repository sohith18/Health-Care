import React, { useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DailyIframe from '@daily-co/daily-js';

export default function VideoCall() {
  const { id } = useParams();
  console.log("The id is " + id);

  useEffect(() => {
    const domain = "https://our-sub-domain-test.daily.co/";

    axios
      .get(`/video-call/${id}`)
      .then((res) => {
        if (res.status === 200) {
          const callFrame = DailyIframe.createFrame({
            showFullscreenButton: true,
            iframeStyle: {
              position: 'fixed',
              border: '1px solid black',
              width: '375px',
              height: '450px',
              right: '1em',
              bottom: '1em',
            },
          });

          callFrame.join({
            url: `${domain}${id}`,
          });
        }
      })
      .catch((err) => console.log(err));
  }, [id]);

  return <div></div>;
}


