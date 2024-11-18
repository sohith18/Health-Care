import mongoose from "mongoose";

const BookingSchema = mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' , requierd: true},
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' , requierd: true},
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' , requierd: true},
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
});

const Booking = mongoose.model('Booking', BookingSchema)
export default Booking