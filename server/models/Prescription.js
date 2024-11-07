import mongoose from "mongoose";

const PrescriptionSchema = mongoose.Schema({
    medicines: [String],
    text: [String],
    // appointmentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema)
export default Prescription