const express = require('express');
const router = express.Router();
const cors = require('cors');
const {test, registerUser, loginUser} = require('../controllers/authController');
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

module.exports = router;