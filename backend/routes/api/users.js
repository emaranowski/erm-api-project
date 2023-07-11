// this file holds resources for route paths beginning in: /api/users

const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// midware to validate email, password, username keys that we expect to have in req.body
// 2023-07-07: added firstName + lastName
const validateSignup = [
  check('firstName') // check if req.body.firstName exists
    .exists({ checkFalsy: true })
    .withMessage('First Name is required'),
  check('lastName') // check if req.body.lastName exists
    .exists({ checkFalsy: true })
    .withMessage('Last Name is required'),
  check('email') // check if req.body.email is an email
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email'),
  // check('email') // currently err seems to be coming from model val; should come from here
  //   .exists({ checkFalsy: true })
  //   .isUnique()
  //   .withMessage('User with that email already exists'),
  // check('username') // currently err seems to be coming from model val; should come from here
  //   .exists({ checkFalsy: true })
  //   .isUnique()
  //   .withMessage('User with that username already exists'),
  check('username') // check if req.body.username has min len 4
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username') // check if req.body.username is not an email
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password') // check if req.body.password is not empty & has min len 6
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
]; // if at least one val fails, ret err as res

// Sign up (POST /api/users)
router.post(
  '/',
  validateSignup, // connect
  async (req, res) => {
    const { firstName, lastName, email, password, username } = req.body;
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({ firstName, lastName, email, username, hashedPassword });

    const safeUser = { // non-sensitive info
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    // use setTokenCookie to log in user by creating
    // JWT cookie w/ user's non-sensitive info as payload
    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

/*
test signup validation w/ firstName & lastName
go to: http://localhost:8000/api/csrf/restore
make fetch req (pass in XSRF-TOKEN val):

fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "XFejmbnF-1UZxzbpuRAnFMiSn_kbtZdXY75o"
  },
  body: JSON.stringify({
    firstName: 'TestSignupWithFirstName',
    lastName: 'TestSignupWithLastName',
    email: 'TestSignupWithFirstName@demo.com',
    username: 'TestSignupWithFirstName1',
    password: 'TestSignupWithFirstNamePassword1'
  })
}).then(res => res.json()).then(data => console.log(data));

should have:

Promise {<pending>}
[[PromiseState]]: "fulfilled"

correct json res should be:

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

to test, go to: http://localhost:8000/api/csrf/restore
make fetch req in browser DevTool console
pass in val of XSRF-TOKEN cookie

fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "LZrQboi0-7hwwrFd8ciCTLUmYgGcnFXe0I4w"
  },
  body: JSON.stringify({
    email: 'signuptest@demo.com',
    username: 'SignupTest1',
    password: 'password4'
  })
}).then(res => res.json()).then(data => console.log(data));

Should have:
Promise {<pending>}
[[PromiseState]]: "fulfilled"

correct json res should be:

{
  user: {
    id,
    email,
    username
  }
}

// test non-unique email:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "LZrQboi0-7hwwrFd8ciCTLUmYgGcnFXe0I4w"
  },
  body: JSON.stringify({
    email: 'signuptest@demo.com',
    username: 'SignupTest2',
    password: 'password5'
  })
}).then(res => res.json()).then(data => console.log(data));
// should ret 'Validation Error'
// errors: {email: 'email must be unique'}

// test non-unique username:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "LZrQboi0-7hwwrFd8ciCTLUmYgGcnFXe0I4w"
  },
  body: JSON.stringify({
    email: 'uniqueemail1@demo.com',
    username: 'DemoUser1',
    password: 'password6'
  })
}).then(res => res.json()).then(data => console.log(data));
// should ret 'Validation Error'
// errors: {username: 'username must be unique'}

*/



/*

test signup validation -- go to: http://localhost:8000/api/csrf/restore

make fetch req (pass in XSRF-TOKEN val)

*** pw is empty:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "tj5XqqsU-qaI0o0E2zzr881PHiv8QiAqxfiI"
  },
  body: JSON.stringify({
    email: 'TestSignup2@demo.com',
    username: 'TestSignup2',
    password: ''
  })
}).then(res => res.json()).then(data => console.log(data));
*** should see: 'Bad Request' ... errors: {password: 'Password must be 6 characters or more.'}

*** pw is only 5 chars:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "tj5XqqsU-qaI0o0E2zzr881PHiv8QiAqxfiI"
  },
  body: JSON.stringify({
    email: 'TestSignup2@demo.com',
    username: 'TestSignup2',
    password: '12345'
  })
}).then(res => res.json()).then(data => console.log(data));
*** should see: 'Bad Request' ... errors: {password: 'Password must be 6 characters or more.'}

*** email is empty:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "tj5XqqsU-qaI0o0E2zzr881PHiv8QiAqxfiI"
  },
  body: JSON.stringify({
    email: '',
    username: 'TestSignup2',
    password: 'TestSignupPW2'
  })
}).then(res => res.json()).then(data => console.log(data));
*** should see: 'Bad Request' ... errors: {email: 'Please provide a valid email.'}

*** email is not an email:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "tj5XqqsU-qaI0o0E2zzr881PHiv8QiAqxfiI"
  },
  body: JSON.stringify({
    email: 'hello',
    username: 'TestSignup2',
    password: 'TestSignupPW2'
  })
}).then(res => res.json()).then(data => console.log(data));
*** should see: 'Bad Request' ... errors: {email: 'Please provide a valid email.'}

*** username is empty:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "tj5XqqsU-qaI0o0E2zzr881PHiv8QiAqxfiI"
  },
  body: JSON.stringify({
    email: 'TestSignup2@demo.com',
    username: '',
    password: 'TestSignupPW2'
  })
}).then(res => res.json()).then(data => console.log(data));
*** should see: 'Bad Request' ... errors: {username: 'Please provide a username with at least 4 characters.'}

*** username is only 3 chars:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "tj5XqqsU-qaI0o0E2zzr881PHiv8QiAqxfiI"
  },
  body: JSON.stringify({
    email: 'TestSignup2@demo.com',
    username: 'lol',
    password: 'TestSignupPW2'
  })
}).then(res => res.json()).then(data => console.log(data));
*** should see: 'Bad Request' ... errors: {username: 'Please provide a username with at least 4 characters.'}

*** username is an email:
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": "tj5XqqsU-qaI0o0E2zzr881PHiv8QiAqxfiI"
  },
  body: JSON.stringify({
    email: 'TestSignup2@demo.com',
    username: 'TestSignup2@demo.com',
    password: 'TestSignupPW2'
  })
}).then(res => res.json()).then(data => console.log(data));
*** should see: 'Bad Request' ... errors: {username: 'Username cannot be an email.'}

*/



module.exports = router;
