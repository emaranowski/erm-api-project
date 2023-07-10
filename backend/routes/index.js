const express = require('express');
const router = express.Router();

const apiRouter = require('./api'); // imports ./api/index.js
router.use('/api', apiRouter); // prefixes all routes in api router with '/api'

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
