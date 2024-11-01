import express from "express";
import {signup, login} from "../services/AuthService.js"

const AuthRouter = express.Router();

AuthRouter.post('/signup', async (req, res) => {
    const user = req.body;
    let response = null;
    try {
        response = await signup(user);
        console.log(response)
        res.status(response.status)
    }
    catch (error) {
        console.log(error);
        res.status(403)
    }
    res.send(response)
})

AuthRouter.post('/login', async (req, res) => {
    const userCreds = req.body;
    let response = null;
    try {
        response = await login(userCreds);
        res.status(response.status);
    }
    catch (err) {
        console.log(err);
        res.status(403);
    }
    res.send(response)
})


export default AuthRouter;