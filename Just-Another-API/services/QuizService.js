import Quiz from '../models/Quiz.js'
import User from '../models/User.js';

const createQuiz = async (quiz, user) => {
    try {
        const savedQuiz = new Quiz(quiz);
        await savedQuiz.save();
        user.quizzes_made.push(savedQuiz);
        await User.findOneAndUpdate({ _id: user._id }, user);
        return {
            status: 200,
            msg: "Saved quiz successfully",
            quiz: savedQuiz
        }
    } 
    catch (err) {
        console.log(err)
        if ( err.code == 11000 ) {
            return {
                quiz: null,
                msg: err.name,
                status: 409
            }
        }
        return {
            quiz: null,
            msg: err.name,
            status: err.status
        }
    } 
}

const getQuiz = async (id) => {
    try {
        const quiz = await Quiz.findOne({ _id: id })
        return {
            quiz: quiz,
            msg: "fetched successfully",
            status: 200
        };
    }
    catch (err) {
        // console.log(err)
        return {
            quiz: null,
            msg: err.name,
            status: 500
        };
    }
}

const updateQuiz = async (quiz) => {
    try {
        const new_quiz = await Quiz.findOneAndUpdate({ _id: quiz._id }, quiz)
        return {
            quiz: new_quiz,
            msg: "updated successfully",
            status: 200
        };
    }
    catch (err) {
        console.log(err);
        return {
            quiz: null,
            msg: err.name,
            status: 500
        };
    }
}

const deleteAttemptedQuiz = async (id, user) => {
    try {
        await User.updateOne(
            { _id: user._id },
            {
                $pullAll: {
                    quizzes_attempted: [{ _id: id }]
                }
            }
        );
        
        return {
            msg: "Deleted successfully",
            status: 200
        };
    } catch (err) {
        console.log(err);
        return {
            msg: err.message,
            status: 500
        };
    }
};



const deleteQuiz = async (id, user) => {
    try {
        const quiz = await Quiz.findOneAndDelete({ _id: id })
        User.updateOne({ _id: user._id }, {
            $pullAll: {
                quizzes_made: [{_id: id}],
            },
        });
        
        return {
            quiz: quiz,
            msg: "deleted successfully",
            status: 200
        };
    }
    catch (err) {
        console.log(err)
        return {
            quiz: null,
            msg: err.name,
            status: 500
        };
    }
}

const updateAnswers = async (chosenAnswers, user, quiz) => {
    try {
        quiz.attempts.push({
            user: user,
            answers: chosenAnswers
        })

        user.quizzes_attempted.push(quiz)
        await User.findOneAndUpdate({ _id: user._id }, user);
        
        const new_quiz = await Quiz.findOneAndUpdate({ _id: quiz._id }, quiz)
        return {
            quiz: quiz,
            msg: "quiz taken successfully",
            status: 200
        };
    }
    catch (err) {
        console.log(err)
        return {
            quiz: null,
            msg: err.name,
            status: 500
        };
    }
}

export {
    createQuiz,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    updateAnswers,
    deleteAttemptedQuiz
}