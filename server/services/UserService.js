import { jwtDecode } from 'jwt-decode';
import { User } from '../models/User.js'
import bcrypt from 'bcrypt'

const saltRounds = 10;

const getUser = async (token) => {
    try {
        const decoded = jwtDecode(token);
        console.log("decoded-----", decoded)
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


const updateUser = async (userData) => {
    try {
        if (userData.password) {
            const pass = userData.password;
            const hash = await bcrypt.hash(pass, saltRounds);
            userData.password = hash;
        }
        const newUser = await User.findOneAndUpdate(userData);
        return {
            user: newUser,
            msg: 'updated user',
            status: 200
        }
    }
    catch (err) {
        
        return {
            user: null,
            msg: err.message,
            status: 500
        }
    }
    
}

export {
    getUser,
    updateUser
}
