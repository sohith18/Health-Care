import mongoose from "mongoose";

const options = { discriminatorKey: 'user' }
const UserSchema = mongoose.Schema({
    first_name: { type: String, required:true },
    last_name: { type: String, required:true },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    profile_picture: String,
    password: { type: String, required: true },
    role: { type: String, required: true },
}, options)


const User = mongoose.model('User', UserSchema);


const Patient = User.discriminator(
    'Patient',
    new mongoose.Schema({  }, options)
);

const Doctor = User.discriminator(
    'Doctor',
    new mongoose.Schema({ 
        qualifications: [String],
        slots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Slot' }] ,
     }, options)
);

export {
    User, 
    Patient,
    Doctor
};
