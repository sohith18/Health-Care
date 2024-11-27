import express from 'express'
import { getMeetDetails } from '../services/MeetService.js';
const MeetRouter = express.Router();

MeetRouter.get('/:specialization',async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await getMeetDetails(token, req.params.specialization);
    res.status(response.status);
    res.send(response);
})



export default MeetRouter;