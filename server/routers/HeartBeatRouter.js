// create heatbeat router
import express from 'express';
import getHeartBeat from '../services/HeartBeatService.js';
const HeartBeatRouter = express.Router();

HeartBeatRouter.get('/', async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await getHeartBeat(token);
    res.status(response.status);
    res.send(response);
});

export default HeartBeatRouter;
