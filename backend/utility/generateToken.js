const jwt = require('jsonwebtoken');

const generateToken = (id, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('jwt', token, {
        httpOnly: true, // Prevents client-side access
        secure: process.env.NODE_ENV === 'production', // Ensures secure cookies in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return token;
};

module.exports = generateToken;
