// create heatbeat router
import express from 'express';
import { getHeartBeat, rejectHeartBeat} from '../services/HeartBeatService.js';
const HeartBeatRouter = express.Router();

HeartBeatRouter.get('/', async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await getHeartBeat(token);
    res.status(response.status);
    res.send(response);
});

HeartBeatRouter.get('/reject/:callId', async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await rejectHeartBeat(token, req.params.callId);
    res.status(response.status);
    res.send(response);
});

export default HeartBeatRouter;
