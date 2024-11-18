import express from 'express'
import { getAllDoctors, updateDoctor } from '../services/DoctorService.js';
const DoctorRouter = express.Router();

DoctorRouter.post('/',async (req, res) => {
    const response = await getAllDoctors(req.body);
    res.status(response.status);
    res.send(response);
})

DoctorRouter.put('/', async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await updateDoctor(token, req.body);
    res.status(response.status);
    res.send(response);
})


export default DoctorRouter;