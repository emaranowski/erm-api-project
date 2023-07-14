const router = require('express').Router();
const sessionRouter = require('./session.js');

const usersRouter = require('./users.js');
const groupsRouter = require('./groups.js');
const venuesRouter = require('./venues.js');
const groupImagesRouter = require('./group-images.js');
const eventsRouter = require('./events.js');
const eventImagesRouter = require('./event-images.js');


const { restoreUser } = require('../../utils/auth.js');


// Connect restoreUser middleware to the API router
//   If current user session is valid, set req.user to the user in the database
//   If current user session is not valid, set req.user to null
router.use(restoreUser); // keep restoreUser midware connected before any other midware or route handlers
// lets all other route handlers retrieve current user on Request object as req.user
// If a valid current user session, req.user = the User in the database
// If NO valid current user session, req.user = null


router.use('/session', sessionRouter);

router.use('/users', usersRouter);
router.use('/groups', groupsRouter);
router.use('/venues', venuesRouter);
router.use('/group-images', groupImagesRouter);
router.use('/events', eventsRouter);
router.use('/event-images', eventImagesRouter);


router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
});


module.exports = router;


























// // // TEST ROUTES BELOW
// // // TEST ROUTES BELOW
// // // TEST ROUTES BELOW


// imports for testing
// const { setTokenCookie } = require('../../utils/auth.js'); // for GET /api/set-token-cookie
// const { requireAuth } = require('../../utils/auth.js'); // for GET /api/require-auth
// const { User } = require('../../db/models'); // for GET /api/set-token-cookie


// // test POST /api/test
// router.post('/test', function (req, res) {
//     res.json({ requestBody: req.body });
// });


// // test GET /api/set-token-cookie:
// // browser DevTools > Application: should show 'token' cookie
// router.get('/set-token-cookie', async (_req, res) => {
//     const user = await User.findOne({
//         where: {
//             username: 'DemoUser1'
//         }
//     });
//     setTokenCookie(res, user);
//     return res.json({ user: user });
// });


// // test GET /api/restore-user:
// // test restoreUser middleware to check
// // if req.user key has been populated correctly
// router.get('/restore-user', (req, res) => {
//     return res.json(req.user);
// }); // should ret DemoUser1 info as JSON obj:
// // id, username, email, createdAt, updatedAt
// // browser DevTools > Application: delete 'token' cookie
// // refresh http://localhost:8000/api/restore-user > should ret null


// // test GET /api/require-auth
// router.get('/require-auth', requireAuth, (req, res) => {
//     return res.json(req.user);
// });
// // if 'token' cookie present: should ret demo user's info as JSON
// // if 'token' cookie not present: should ret "Unauthorized" error


/*

Test this route by navigating to http://localhost:8000/api/csrf/restore
and creating a fetch request in the browser's DevTools console.
- "XSRF-TOKEN": "value of XSRF-TOKEN cookie"

fetch('/api/test', {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": "fnFurwzJ-AMrW8IlRC8Rb8YRHnA5_EblLevg"
    },
    body: JSON.stringify({ hello: 'world' })
}).then(res => res.json()).then(data => console.log(data));

*/
