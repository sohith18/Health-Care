import Meet from "../models/Meet.js";
import { getUser } from "./UserService.js";
import env from "dotenv";
env.config()
const getHeartBeat = async (token) => {
    const user = await getUser(token);
    if (user.status !== 200) return user;
    if (user.user.role !== 'doctor') return { status: 200, msg: "User is not a doctor" };

    for (let i = 0; i < user.user.specializations.length; i++) {
        const meet = await Meet.find({ specialization: user.user.specializations[i], status: 'pending' });
        if (meet.length > 0) {
            const meetToken = jwt.sign({ user_id: userRes.user._id }, SECRET_MEET_TOKEN, { expiresIn: '1h' });
            return {
                status: 200,
                msg: "You have a meeting scheduled",
                callId: meet._id,
                apiKey: process.env.API_KEY,
                token: meetToken
            };
        }
    }
}

export default getHeartBeat;