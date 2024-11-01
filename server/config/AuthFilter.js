import env from 'dotenv'
import jwt from 'jsonwebtoken';

env.config();

const isExpired = (token) => {        
    const decode = JSON.parse(atob(token.split('.')[1]));
    console.log(decode);
    if (decode.exp * 1000 < new Date().getTime()) {
        return true;
    }
    return false;
};


const isValid = (token) => {
    if (!token) return false;
    try {
        jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
    }
    catch (error) {
        return false;
    }
    return true;
}

const AuthFilter = (req, res, next) => {
    if (req.originalUrl != undefined && (req.originalUrl.substring(0, 5) == '/auth')) 
        next();
    else {
        const header = req.headers;
        const token = header.authorization.substring(7);
        if (!isValid(token) || isExpired(token)) {
            res.status(401);
            res.send({ msg: "Unautherized access" });
        }
        else {
            // console.log("valid: " + !isValid(token), "expired: " + isExpired(token));
            next();
        }
    }
}

export default AuthFilter;