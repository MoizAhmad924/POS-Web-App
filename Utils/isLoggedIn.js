
const jwt = require('jsonwebtoken');

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/users/login');
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.userEmail = decoded.email;
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

module.exports = isLoggedIn;