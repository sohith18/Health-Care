import { jwtDecode } from 'jwt-decode';
import User from '../models/User.js'

const getUserFromToken = async (token) => {
    try {
        const decoded = jwtDecode(token);

        const user = await User.findOne({_id: decoded._id});
        console.log(user);
        return {
            msg: "found user",
            status: 200,
            user: user
        };
    }
    catch (err) {
        console.log(err);
        if ( err.code == 11000 ) {
            return {
                user: null,
                msg: err.name,
                status: 409
            }
        }
        return {
            user: null,
            msg: err.name,
            status: 500
        }
    }
}

const getUser = async (token) => {
    const userRes = await getUserFromToken(token);
    if (userRes.user) {
        await userRes.user.populate('quizzes_made');
        await userRes.user.populate('quizzes_attempted');
    }
    return userRes;
} 

export {
    getUserFromToken,
    getUser,
}
