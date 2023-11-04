require("dotenv").config()
const API_KEY = process.env.daily_API_KEY;
const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + API_KEY,
  };
const getRoom = async (room) => {
    try {
        const res = await fetch(`https://api.daily.co/v1/rooms/${room}`, {
            method: "GET",
            headers,
        });
        const json = await res.json();
        return json;
    } catch (err) {
        return console.error("error:" + err);
    }
};

const createRoom = async (room) => {
    try {
        const res = await fetch("https://api.daily.co/v1/rooms", {
            method: "POST",
            headers,
            body: JSON.stringify({
                name: room,
                properties: {
                    enable_screenshare: true,
                    enable_chat: true,
                    start_video_off: true,
                    start_audio_off: false,
                    lang: "en",
                },
            }),
        });
        const json = await res.json();
        return json;
    } catch (err) {
        return console.log("error:" + err);
    }
};

module.exports={getRoom,createRoom}