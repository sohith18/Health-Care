import mongoose from "mongoose";

const QuizSchema = mongoose.Schema({
    name: { type: String, unique: true, required: true },
    team_size: { type: Number, default: 1, required: true },
    elements: [{
        question: String,
        score: Number,
        noOfOptions: Number,
        options: [{
            value: String,
            isAnswer: Boolean
        }],
    }],
    attempts: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        answers: [Number]
    }]
})

const Quiz = mongoose.model('Quiz', QuizSchema);
export default Quiz;