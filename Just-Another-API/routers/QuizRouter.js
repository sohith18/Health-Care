import express from 'express'
import { createQuiz, getQuiz, updateQuiz, deleteQuiz, updateAnswers, deleteAttemptedQuiz } from '../services/QuizService.js';
import { getUserFromToken } from '../services/UserService.js';

const QuizRouter = express.Router();

QuizRouter.put('/', async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const userRes = await getUserFromToken(token);
    const quiz = req.body;
    // creating a quiz logic
    let response = null;
    response = await createQuiz(quiz, userRes.user)
    res.status(response.status)
    res.send(response)
})


QuizRouter.get('/attempt/:id', async (req, res) => {
    let response = null;
    response = await getQuiz(req.params.id)
    res.status(response.status)
    res.send(response)
})

QuizRouter.delete('/attempt/:id', async (req, res) => {
    let response = null;
    const header = req.headers;
    const token = header.authorization.substring(7);
    const userRes = await getUserFromToken(token);
    response = await deleteAttemptedQuiz(req.params.id, userRes.user)
    res.status(response.status)
    res.send(response)
})

QuizRouter.post('/attempt', async (req, res) => {   // need to test
    let response = null;
    const header = req.headers;
    const token = header.authorization.substring(7);
    const userRes = await getUserFromToken(token);
    response = await updateAnswers(req.body.answers, userRes.user, req.body.quiz);
    res.status(response.status)
    res.send(response)
})

QuizRouter.post('/', async (req, res) => {
    let response = null;
    response = await updateQuiz(req.body)
    res.status(response.status)
    res.send(response)
})

QuizRouter.delete('/:id', async (req, res) => { // need to test
    let response = null;
    const header = req.headers;
    const token = header.authorization.substring(7);
    const userRes = await getUserFromToken(token);
    response = await deleteQuiz(req.params.id, userRes.user)
    res.status(response.status)
    res.send(response)
})

export default QuizRouter;