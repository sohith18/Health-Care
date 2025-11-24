import mongoose from "mongoose";

const BookingSchema = mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' , required: true},
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' , required: true},
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' , required: true},
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
});

const Booking = mongoose.model('Booking', BookingSchema)
export default Booking