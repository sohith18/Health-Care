import express from 'express'
import { getMeetDetails } from '../services/MeetService.js';
const MeetRouter = express.Router();

MeetRouter.get('/',async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await getMeetDetails(token);
    res.status(response.status);
    res.send(response);
})


export default MeetRouter;