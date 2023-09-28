const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { ValidationError } = require('sequelize');

// isProduction: check if env is in prod
// by checking env key in backend/config/index.js
const { environment } = require('./config');
const isProduction = environment === 'production'; // T/F boolean

const app = express(); // initialize Express

app.use(morgan('dev')); // connect morgan midware, to log info about requests & responses
app.use(cookieParser()); // midware to parse cookies
app.use(express.json()); // midware to parse JSON bodies of reqs w/ Content-Type "application/json"

// security: only allow CORS in development
if (!isProduction) { // if not production
    app.use(cors());
} // in dev: React frontend & Express backend come from diff servers
// in prod, CORS not needed, since all React & Express resources come from same origin

// security: set a variety of headers to help secure app
app.use( // add crossOriginResourcePolicy to helmet midware
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    })
); // allows images w/ URLs to render in deployment

// security: add csurf midware; configure to use cookies
// Set the _csrf token and create req.csrfToken method
app.use(
    csurf({ // add _csrf cookie to any server response
        cookie: { // also adds a method on all requests (req.csrfToken) that will be set to another cookie (XSRF-TOKEN) later on
            secure: isProduction,
            sameSite: isProduction && "Lax",
            httpOnly: true // cannot be read by JS
        }
    })
); // both cookies together provide CSRF protection

app.use(routes); // connect all routes
// app.use('/groups', require('./routes/groups'));



// Catch unhandled requests not defined in any prev route; forward to error handler
// underscore before _req & _res = just a visual indicator by the author
// that those args aren't being used in the function
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found." };
    err.status = 404;
    next(err);
});
// next invoked w/ nothing:
// - error handlers defined after this midware will NOT be invoked.
// next invoked w/ error:
// - error handlers defined after this midware will be invoked.

// Catch sequelize errors; format them; then send the err response
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error:
    if (err instanceof ValidationError) {
        let errors = {};
        for (let error of err.errors) {
            errors[error.path] = error.message;
        }
        err.title = 'Validation error';
        err.errors = errors;
    }
    next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack
    });
}); // should be the last middleware


module.exports = app;
