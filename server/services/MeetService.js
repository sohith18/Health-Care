import { getUser } from "./UserService.js"
import { randomUUID } from "crypto";
import env from "dotenv";
import jwt from 'jsonwebtoken';
import Role from "../enums/Role.js";
import Meet from "../models/Meet.js";


env.config();
const API_KEY = process.env.API_KEY;
const SECRET_MEET_TOKEN = process.env.SECRET_MEET_TOKEN

const getMeetDetails = async (token, specialization) => {
    const userRes = await getUser(token)
    if (userRes.status != 200) {
        return userRes;
    }
    // create Meet model
    const patient = await User.findOne({ _id: userRes.user._id, role: Role.PATIENT });
    if (!patient) {
        return { status: 404, msg: "User is not a patient" };
    }

    const meeting = await Meet.save({
        patientId: patient._id,
        status: 'pending',
        createdAt: Date.now(),
        specialization: specialization
    })
    
    const meetToken = jwt.sign({ user_id: userRes.user._id }, SECRET_MEET_TOKEN, { expiresIn: '1h' });
    return {
        ...userRes,
        callId: meeting._id,
        apiKey: API_KEY,
        token: meetToken
    }
}



export {
    getMeetDetails
}