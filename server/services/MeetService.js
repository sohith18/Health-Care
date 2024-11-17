import { getUser } from "./UserService.js"
import { randomUUID } from "crypto";
import env from "dotenv";
import jwt from 'jsonwebtoken';


env.config();
const API_KEY = process.env.API_KEY;
const SECRET_MEET_TOKEN = process.env.SECRET_MEET_TOKEN

const getMeetDetails = async (token) => {
    const userRes = await getUser(token)
    if (userRes.status != 200) {
        return userRes;
    }
    // remove later?
    const callId = randomUUID();
    const meetToken = jwt.sign({ user_id: userRes.user._id }, SECRET_MEET_TOKEN, { expiresIn: '24h' });
    return {
        ...userRes,
        callId: callId,
        apiKey: API_KEY,
        token: meetToken
    }
}



export {
    getMeetDetails
}