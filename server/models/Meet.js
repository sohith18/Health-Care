import mongoose from 'mongoose';

const MeetSchema = new mongoose.Schema({
    doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'Doctor'},
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true},
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    rejectedBy: [{type: mongoose.Schema.Types.ObjectId, ref: 'Doctor'}],
    specialization: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Meet = mongoose.model('Meet', MeetSchema);
export default Meet;