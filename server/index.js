const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const { getRoom, createRoom } = require("./controllers/videoCallController");
const logger = require("morgan");
const app = express();

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log("Error: database not connected ", err));

//middleware
app.use(express.json())
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/authRoutes'));

app.get("/video-call/:id", async function (req, res) {
    const roomId = req.params.id;
  
    const room = await getRoom(roomId);
    if (room.error) {
      const newRoom = await createRoom(roomId);
      res.status(200).send(newRoom);
    } else {
      res.status(200).send(room);
    }
  });
const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));