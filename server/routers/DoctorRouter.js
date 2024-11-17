import express from 'express'
import { getAllDoctors } from '../services/DoctorService.js';
const DoctorRouter = express.Router();

DoctorRouter.post('/',async (req, res) => {
    const header = req.headers;
    const response = await getAllDoctors(req.body);
    res.status(response.status);
    res.send(response);
})


export default DoctorRouter;