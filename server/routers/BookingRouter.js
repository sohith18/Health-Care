import express from 'express'
import { createBooking, getBookings, addPrescription } from '../services/BookingService.js';
const BookingRouter = express.Router();

// req.body = { doctorID, slotID, prescription (optional) }
BookingRouter.put('/',async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await createBooking(token, req.body);
    res.status(response.status);
    res.send(response);
})

BookingRouter.get('/', async (req, res) => { 
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await getBookings(token);
    res.status(response.status);
    res.send(response);
})


// req.body = { bookingID, medicines: [{name, details}], comments }
BookingRouter.post('/', async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await addPrescription(token, req.body);
    res.status(response.status);
    res.send(response);
})

export default BookingRouter;