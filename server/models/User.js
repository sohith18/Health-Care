import mongoose from "mongoose";

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
    quizzes_made: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'
    }],
    quizzes_attempted: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'
    }],
    role: { type: String, required: true },
})
// add string attempt id in quizzes attempted
const User = mongoose.model('Users', UserSchema);
export default User;