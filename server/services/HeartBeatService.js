import Role from "../enums/Role.js";
import Meet from "../models/Meet.js";
import { getUser } from "./UserService.js";
import env from "dotenv";
import jwt from 'jsonwebtoken';
env.config()
const getHeartBeat = async (token) => {
    try {
        const user = await getUser(token);
        if (user.status !== 200) return user;
        if (user.user.role !== Role.DOCTOR) return { status: 404, msg: "User is not a doctor" };

        // check if doctor is in a meeting
        const meet = await Meet.find({ doctorId: user.user._id, status: 'pending' });
        if (meet.length > 0) {
            return {
                status: 200,
                msg: "Doctor is in a meeting",
            }
        }

        for (let i = 0; i < user.user.specializations.length; i++) {
            const meet = await Meet.find({ specialization: user.user.specializations[i], status: 'pending' });
            console.log("---------------", meet, user.user.specializations[i]);
            const filteredMeet = meet.filter((m) => m.rejectedBy.indexOf(user.user._id) === -1);
            console.log("---------------", filteredMeet);
            if (filteredMeet.length > 0) {
                
                const meetToken = jwt.sign({ user_id: user.user._id }, process.env.SECRET_MEET_TOKEN, { expiresIn: '1h' });
                return {
                    status: 200,
                    msg: "You have a meeting scheduled",
                    callId: filteredMeet[0]._id,
                    apiKey: process.env.API_KEY,
                    token: meetToken
                };
            }
        }
        return {
            status: 200,
            msg: "No meetings scheduled"
        }
    }
    catch (err) {
        console.log(err);
        return { status: 500, msg: err.name };
    }
}

const rejectHeartBeat = async (token, callId) => {
    try {
        const user = await getUser(token);
        if (user.status !== 200) return user;
        if (user.user.role !== Role.DOCTOR) return { status: 404, msg: "User is not a doctor" };

        const meet = await Meet.findOne({ _id: callId });
        if (!meet) return { status: 404, msg: "Meeting not found" };
        if (meet.rejectedBy.indexOf(user.user._id) === -1) {
            meet.rejectedBy.push(user.user._id);
            await meet.save();
        }
        return {
            status: 200,
            msg: "Meeting rejected"
        }
    }
    catch (err) {
        console.log(err);
        return { status: 500, msg: err.name };
    }
}

export {
    getHeartBeat, 
    rejectHeartBeat
};