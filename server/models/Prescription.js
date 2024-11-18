import mongoose from "mongoose";

const PrescriptionSchema = mongoose.Schema({
    medicines: [{
        name: String,
        details: String,
    }],
    comments: String,
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema)
export default Prescription