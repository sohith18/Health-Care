import express from 'express'
import { getAllDoctors } from '../services/DoctorService.js';
const DoctorRouter = express.Router();

DoctorRouter.get('/',async (req, res) => {
    const header = req.headers;
    const response = await getAllDoctors();
    res.status(response.status);
    res.send(response);
})


export default DoctorRouter;