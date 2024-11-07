import mongoose from "mongoose";

const BookingSchema = mongoose.Schema({
    patientID: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
});

const Booking = mongoose.model('Booking', BookingSchema)
export default Booking