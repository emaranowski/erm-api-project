const express = require('express');
const router = express.Router();

const apiRouter = require('./api'); // imports ./api/index.js
router.use('/api', apiRouter); // prefixes all routes in api router with '/api'

// in dev, backend & frontend servers are separate
// in prod, backend also serves all frontend assets,
// incl. index.html + any JS in frontend/build (after running npm start in frontend)

// in prod, XSRF-TOKEN is attached to index.html in frontend/build
// serve index.html file at '/' route, and any routes that don't start w/ '/api'
// attach XSRF-TOKEN cookie to res
// serve static files in frontend/build folder using express.static midware

// after `router.use('/api', apiRouter);`...
// Static routes
// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    // Serve frontend's index.html file at root route
    router.get('/', (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.sendFile(
            path.resolve(__dirname, '../../frontend', 'build', 'index.html')
        );
    });

    // Serve static assets in frontend's build folder
    router.use(express.static(path.resolve("../frontend/build")));

    // Serve frontend's index.html file at all other routes NOT starting with /api
    router.get(/^(?!\/?api).*/, (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.sendFile(
            path.resolve(__dirname, '../../frontend', 'build', 'index.html')
        );
    });
}

// in dev, need another way to get XSRF-TOKEN cookie on frontend app
// because React frontend is on diff server than Express backend,
// so add a XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
    router.get('/api/csrf/restore', (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.status(201).json({});
    });
}



// test route -- OK to remove
// router.get('/hello/world', function (req, res) {
//     res.cookie('XSRF-TOKEN', req.csrfToken()); // cookie('name', value)
//     res.send('Hello World!'); // 'Hello World!' = res body
// });

// Add a XSRF-TOKEN cookie
// allows any developer to re-set CSRF token cookie 'XSRF-TOKEN'
router.get("/api/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken); // cookie('name', value)
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
});
// NOTE: This route should not be available in production,
// but it will not be exclusive to the production app
// until you implement the frontend later.
// So for now, it will remain available to both dev & prod env.

module.exports = router;
