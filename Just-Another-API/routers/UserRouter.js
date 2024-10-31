import express from 'express'
import { getUser } from '../services/UserService.js';
const UserRouter = express.Router();

UserRouter.get('/',async (req, res) => {
    const header = req.headers;
    const token = header.authorization.substring(7);
    const response = await getUser(token);
    res.status = response.status;
    res.send(response);
})

export default UserRouter;