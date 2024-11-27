import express from 'express'
import { getMeetDetails, deleteMeetDetails } from '../services/MeetService.js';
const MeetRouter = express.Router();

MeetRouter.get('/:specialization/:id',async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    console.log(token, req.params.specialization);
    const response = await getMeetDetails(token, req.params.specialization, req.params.id);
    res.status(response.status);
    res.send(response);
})

MeetRouter.delete('/:id', async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await deleteMeetDetails(token, req.params.id);
    res.status(response.status);
    res.send(response);
})


export default MeetRouter;