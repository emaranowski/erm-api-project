// resources for route paths beginning in: /api/session
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator'); // check func will be used w/ handleValidationErrors to validate body of req
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();


// login validator (if one check fails, error is returned as response)
// middleware composed of check & handleValidationErrors midwares
const validateLogin = [
  check('credential') // check that req.body.credential is not missing
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Credential is required (email or username)'),
  check('password') // check that req.body.password is not missing
    .exists({ checkFalsy: true })
    .withMessage('Password is required'),
  handleValidationErrors
];


// Log in (POST /api/session)
router.post('/', validateLogin, async (req, res, next) => {
  // get credential and password
  // (credential can be either email or username)
  const { credential, password } = req.body;

  // get user with matching email or username
  // turn off default scope to read/get all user attributes, including hashedPassword
  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential
      }
    }
  });

  // if user not found, or pw from req.body doesn't match user.hashedPassword
  if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
    const err = new Error('Login failed');
    err.status = 401;
    err.title = 'Login failed';
    err.errors = { credential: 'The provided credentials were invalid.' };
    return next(err); // return 401 login failed error
  };

  // if user is found, and pw from req.body matches user.hashedPassword (pw is correct)
  // create safeUser, including only non-sensitive user data (i.e. excluding pw)
  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  // set token cookie
  await setTokenCookie(res, safeUser);

  // return safeUser
  return res.json({ user: safeUser });
});


// Log out (DELETE /api/session)
router.delete('/', (_req, res) => {
  res.clearCookie('token'); // remove 'token' cookie from res
  return res.json({ message: 'success' });
});


// Restore session user (GET /api/session)
router.get('/', (req, res) => {
  // get session user from request
  const { user } = req;

  if (user) { // if session user exists
    // create safeUser, including only non-sensitive user data (i.e. excluding pw)
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };
    // return session user as JSON object with key-value pair of `user: safeUser`
    return res.json({ user: safeUser });

  } else { // if no session user
    // return JSON object with key-value pair of `user: null`
    return res.json({ user: null });
  };
});


module.exports = router;


///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////// fetch requests for testing login ////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////


/*
Test login route w/ firstName & lastName -- go to:
http://localhost:8000/api/csrf/restore
make fetch req from browser DevTools console (pass in val of XSRF-TOKEN)

fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "XFejmbnF-1UZxzbpuRAnFMiSn_kbtZdXY75o"
  },
  body: JSON.stringify({ credential: 'DemoUser1', password: 'password1' })
}).then(res => res.json()).then(data => console.log(data));

*** should have:
Promise {<pending>}
[[PromiseState]]: "fulfilled"

*** correct JSON res should have:
{
  user: {
    id,
    firstName,
    lastName,
    email,
    username
  }
}
*/


/*
Test login route by navigating to
http://localhost:8000/api/csrf/restore
then make fetch request from browser DevTools console
(pass in the value of the XSRF-TOKEN)

fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "KfQBP5le-tpAoFHwrlCcjCFXbWeRb6byQHkE"
  },
  body: JSON.stringify({ credential: 'DemoUser1', password: 'password1' })
}).then(res => res.json()).then(data => console.log(data));

// also try for credential: 'demo1@demo.com'

Should have:
Promise {<pending>}
[[PromiseState]]: "fulfilled"

Correct JSON response format, if user is successfully logged in:
{
  user: {
    id,
    email,
    username
  }
}
*/


/*
test login validation -- go to: http://localhost:8000/api/csrf/restore
fetch from browser DevTools console (pass in XSRF-TOKEN val):

* set credential user field to empty string;
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "rpJzCTqP-NgKFUUQUtC_BqJ5ZjcFM4qL_j8g"
  },
  body: JSON.stringify({ credential: '', password: 'password1' })
}).then(res => res.json()).then(data => console.log(data));
* should get 'Bad Request' error, w/ 'Please provide a valid email or username.' as one of the errors.

* set password field to empty string;
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "rpJzCTqP-NgKFUUQUtC_BqJ5ZjcFM4qL_j8g"
  },
  body: JSON.stringify({ credential: 'DemoUser1', password: '' })
}).then(res => res.json()).then(data => console.log(data));
* should get 'Bad Request' error, w/ 'Please provide a password' as one of the errors.

am getting:
title: 'Server Error', message: 'validationResult is not defined'
at express-validator/src/middlewares/check.js:16:13
*/


///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////// fetch requests for testing logout ///////
///////////////////////////////////////////////////
///////////////////////////////////////////////////


/*
Test logout route by navigating to
http://localhost:8000/api/csrf/restore
Check that you are logged in by confirming 'token' cookie is present

then make fetch request from browser DevTools console
(pass in the value of the XSRF-TOKEN)

fetch('/api/session', {
  method: 'DELETE',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "ma8k5ADa-gPII8swQWKk80hwrM36gjVToxDg"
  }
}).then(res => res.json()).then(data => console.log(data));

Should have:
Promise {<pending>}
[[PromiseState]]: "fulfilled"

Correct JSON response, if user is successfully logged out:
{message: 'success'}

And should no longer have 'token' cookie.
*/


///////////////////////////////////////////////////
///////////////////////////////////////////////////
// fetch requests to test restoring session user //
///////////////////////////////////////////////////
///////////////////////////////////////////////////


/*

test:
go to http://localhost:8000/api/session
if you have 'token' cookie, should see current session user info
if don't have, should see {"user":null}

to restore 'token' cookie, get XSRF-Token val
http://localhost:8000/api/csrf/restore

*** pass in val and run from browser DevTools console to log back in
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "GQZjb6ww-YYMQbub4x5a-UPIRgab5RCVgXmc"
  },
  body: JSON.stringify({ credential: 'DemoUser1', password: 'password1' })
}).then(res => res.json()).then(data => console.log(data));

then go to http://localhost:8000/api/session

*/


/*

test (GET /api/session) w/ firstName & lastName -- go to:
http://localhost:8000/api/session

if you have 'token' cookie (logged in), should see current session user info in format:
{"user":{"id":1,"firstName":"FirstNameOne","lastName":"LastNameOne","email":"demo1@demo.com","username":"DemoUser1"}}

if don't have 'token' cookie (logged out), should see:
{"user":null}

to restore 'token' cookie, get XSRF-Token val from:
http://localhost:8000/api/csrf/restore

*** pass in XSRF-Token val, and run from browser DevTools console to log back in:
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "WUDaPSzS-egbDhtNOSD3t1WKm-bbZpde5Tqk"
  },
  body: JSON.stringify({ credential: 'DemoUser1', password: 'password1' })
}).then(res => res.json()).then(data => console.log(data));

then go to http://localhost:8000/api/session
should see format:
{"user":{"id":1,"firstName":"FirstNameOne","lastName":"LastNameOne","email":"demo1@demo.com","username":"DemoUser1"}}

whenever logged in, should ret in format:
{
  user: {
    id,
    firstName,
    lastName,
    email,
    username
  }
}
*/
