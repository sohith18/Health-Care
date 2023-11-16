const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");


const test = (req, res) => {
    res.json("Test is working");
}
//Register endpoint
const registerUser = async (req, res) => {
    try {
        const{ name, email, password } = req.body;
        // checks
        if(!name) return res.json({error: "Name is required"});
        if(!password || password.length< 6) 
            return res.json({
                error: "Password is required and atleast 6 characters long"
            });
        if(!email) return res.json({error: "Email is required"});
        //check for email has @ or not
        if(!email.includes('@'))
            return res.json({
                error: "Email id is invalid"
        });
        const exist = await User.findOne({email});
        if(exist)
            return res.json({
                error: "Email is already taken"
            });
        
        // hash password
        const hashedPassword = await hashPassword(password);
        //Create user in database
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword,
        });
            return res.json({
                msg: "Register success",
                data: user
            });

    } catch (error) {
        res.json("Server error").status(500);
    }
}
//Login endpoint
const loginUser = async (req, res) => 
{
    try {
        const {email, password} = req.body;

        //check if user exists
        const user = await User.findOne({email});
        if(!user)
            return res.json({
                error: "No user found"
            })
        //check if password matches
        const match = await comparePassword(password, user.password);
        if(match){
            return res.json(user.name);
        }
        if(!match)
            return res.json({
        error: "Passwords do not match"
        })
    } catch (error) {
        console.log(error);
        res.status(404);
    }
    

}
// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    const sessionToken = req.cookies.sessionToken; // Assuming you store the token in a cookie
  
    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized: No session token provided' });
    }
  
    // Check the validity of the session token (pseudo-code)
    if (isValidSessionToken(sessionToken)) {
      next();
    } else {
      return res.status(401).json({ error: 'Unauthorized: Invalid session token' });
    }
  };
  // fetch the user from the database
  const fetch_user = async (req, res, next) => {
    const sessionToken = req.cookies.sessionToken;
    console.log(sessionToken);
    if (!sessionToken) {
      req.user = null;
      return next();
    }
  
    const user = await User.findOne({ sessionToken });
    req.user = user;
    next();
  }
  

module.exports = {
    test,
    registerUser,
    loginUser,
    isAuthenticated,
    fetch_user
}