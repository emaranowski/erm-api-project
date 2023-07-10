const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// send a JWT cookie (used in login & signup routes)
const setTokenCookie = (res, user) => {
    // create the token
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };
    const token = jwt.sign(
        { data: safeUser },
        secret,
        { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week (from .env)
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return token;
};

// restoreUser will be connected to API router,
// so all API route handlers will check if a current user is logged in or not.
// for routes that require identity of current session user:
// restore session user based on contents of JWT cookie
const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null; // default to null

    // verify and parse JWT's payload,
    // and search db for User w/ id from payload
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            return next();
        }

        try {
            const { id } = jwtPayload.data;
            req.user = await User.findByPk(id, { // if User found w/ id from JWT payload, save to req.user
                attributes: { // override defaultScope on User model, which excludes: hashedPassword, email, createdAt, updatedAt
                    include: ['email', 'createdAt', 'updatedAt'] // just return these 3
                }
            });
        } catch (e) { // if error verifying JWT, or no User found w/ id from payload,
            res.clearCookie('token'); // clear token cookie from res & set req.user to null
            return next();
        }

        if (!req.user) res.clearCookie('token');

        return next();
    });
};

// Define requireAuth midware as an arr,
// w/ restoreUser midware func as 1st ele in arr.

// Ensures that if valid JWT cookie exists,
// session user is loaded into req.user attribute.

// 2nd midware checks req.user:
// if session user is present, it goes to next midware.

// If no session user:
// error is created, and passed to the error-handling midwares.

// require session user to be authenticated before accessing a route
// if no current user, return an error
const requireAuth = function (req, _res, next) { // '_' means arg isn't used in func
    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
}

module.exports = { setTokenCookie, restoreUser, requireAuth };
