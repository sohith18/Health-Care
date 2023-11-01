
const getRoom = (room) => {
    return fetch(`https://api.daily.co/v1/rooms/${room}`, {
        method: "GET",
        headers,
    })
        .then((res) => res.json())
        .then((json) => {
            return json;
        })
        .catch((err) => console.error("error:" + err));
};

const createRoom = (room) => {
    return fetch("https://api.daily.co/v1/rooms", {
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
    })
        .then((res) => res.json())
        .then((json) => {
            return json;
        })
        .catch((err) => console.log("error:" + err));
};

module.exports = { getRoom, createRoom };