const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isLoggedIn = require('../Utils/isLoggedIn');


const router = express.Router();

// Render registration page
router.get('/register', (req, res) => {
    res.render('register');
});

// Render login page
router.get('/login', (req, res) => {
    res.render('login');
});

// User logout
router.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/users/login');
});

// User registration
router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;

    // Checking if username already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).send('email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email,name, password: hashedPassword });
    try {
        await user.save();
        res
        .status(201)
        .redirect('/users/login');
    } catch (error) {
        res.status(400).send(error);
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ email, id: user._id }, 'your_jwt_secret');
    res
    .status(200)
    res
    .cookie("token",token)
    .redirect('/inventory');
});

// User profile
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        email = req.userEmail;
        const user = await User.findOne({email});              
        res
        .status(200)
        .render('profile', { user });
    } catch (error) {
        res.status(400).send('Invalid token');
    }
});

// Update user profile
router.post('/profile/update', isLoggedIn, async (req, res) => {
    const { newEmail,newName, oldPassword, newPassword } = req.body;
    try {
        const user = await User.findOne({ email: req.userEmail });
        if (!user) {
            return res.redirect('/users/login');
        }
        const hash = await user.password;
        const isMatch = await bcrypt.compare(oldPassword, hash);

        if (isMatch) {
            let newHash = await bcrypt.hash(newPassword, 10);
            const user = await User.findOneAndUpdate({ email: decoded.email }, {email: newEmail, name: newName, password: newHash }, { new: true, runValidators: true });
            const token = jwt.sign({ email: newEmail }, 'your_jwt_secret');
            res
            .status(200)
            .cookie("token",token)
            .redirect('/users/profile');
        }
        else{
            return res.status(400).send('Passwords do not match');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;