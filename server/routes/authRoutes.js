const express = require('express');
const router = express.Router();
const cors = require('cors');
const {test, registerUser, loginUser, fetch_user} = require('../controllers/authController');
//middle ware with cors
router.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true
    })
);

router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/user-info', fetch_user);
module.exports = router;