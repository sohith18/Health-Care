import { getUser } from "./UserService.js"
import { randomUUID } from "crypto";
import env from "dotenv";
import jwt from 'jsonwebtoken';
import Role from "../enums/Role.js";
import Meet from "../models/Meet.js";
import { User } from "../models/User.js";


env.config();
const API_KEY = process.env.API_KEY;
const SECRET_MEET_TOKEN = process.env.SECRET_MEET_TOKEN

const getMeetDetails = async (token, specialization, callId) => {
    const userRes = await getUser(token)
    if (userRes.status != 200) {
        return userRes;
    }
    // create Meet model

    const user = await User.findOne({ _id: userRes.user._id });
    let meeting = null;
    if (user.role === Role.PATIENT) {
        meeting = await new Meet({
            patientId: user._id,
            status: 'pending',
            createdAt: Date.now(),
            specialization: specialization
        }).save();
    } else {
        meeting = await Meet.findOneAndUpdate(
            { _id: callId },
            { $set: { doctorId: user._id } },
        )
        if (!meeting) {
            return { status: 404, msg: "Meeting not found" };
        }
    }
    
    const meetToken = jwt.sign(
        {
            user_id: userRes.user._id,
            iat: Math.floor(Date.now() / 1000) - 30 // Unix timestamp
        },
        SECRET_MEET_TOKEN,
        { expiresIn: '1h' }
    );
    
    return {
        ...userRes,
        callId: meeting ? meeting._id: null,
        apiKey: API_KEY,
        token: meetToken
    }
}

const deleteMeetDetails = async (token, callId) => {
    const userRes = await getUser(token)
    if (userRes.status != 200 || userRes.user.Role == Role.DOCTOR) {
        return userRes;
    }
    const meeting = await Meet.findOneAndDelete({ _id: callId });
    if (!meeting) {
        return { status: 404, msg: "Meeting not found" };
    }
    return { status: 200, msg: "Meeting deleted successfully" };
}

export {
    getMeetDetails,
    deleteMeetDetails
}