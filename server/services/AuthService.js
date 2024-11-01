import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import env from 'dotenv';
import bcrypt from 'bcrypt'


env.config()
const saltRounds = 10;
const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN;


async function signup(userData) {
    let password = userData.password;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        userData.password = hash;
        const user = new User(userData);
        const savedUser = await user.save();
        const accessToken = jwt.sign({ _id: savedUser._id }, SECRET_ACCESS_TOKEN, { expiresIn: '1h' });
        return {
            token: accessToken,
            msg: "signed up successfully",
            status: 200,
            user: savedUser
        };
    } catch (err) {
        User.findOneAndDelete({ email: userData.email });
        if ( err.code == 11000 ) {
            return {
                token: null,
                msg: "User already exists",
                status: 409
            }
        }
        console.log(err)
        return {
            token: null,
            msg: "Error during signup",
            status: 500
        };
    }
};
  

const login = async (userCreds) => {
    // let decodedId = jwt.verify(token, SECRET_ACCESS_TOKEN);
    // const user = await User.get({ _id: decodedId })    
    // check password match
    let response = null;
    let accessToken = null;
    let user = null;
    try {
        user = await User.findOne({ email: userCreds.email })
        if (!user) return {
            token: null,
            msg: "User not found",
            status: 404
        };
        const match = await bcrypt.compare(userCreds.password, user.password);
        if (match) {
            accessToken = jwt.sign({ _id: user._id }, SECRET_ACCESS_TOKEN, { expiresIn: '1h' });
        } else {
            return {
                    token: null,
                    msg: "Wrong password",
                    status: 401
                };
        }
    } catch (err) {
        return {
            token: null,
            msg: "Error during login",
            status: 500
        };
    }
    return {
        token: accessToken,
        msg: "Logged in successfully",
        status: 200,
        user: user
    };
}

export {
    signup,
    login
};