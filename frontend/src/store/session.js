// will contain all actions specific to session user's info,
// and session user's Redux reducer.
import { csrfFetch } from "./csrf";

// const SIGNUP_USER = "session/signUpUser";
const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

// STANDARD ACTION CREATORS

// const signUpUser = (user) => {
//   return {
//     type: SIGNUP_USER,
//     user
//   }
// }

const setUser = (user) => {
  return {
    type: SET_USER,
    user
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};

// THUNK ACTION CREATORS

// signup
export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password,
    }),
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

// login
export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({
      credential,
      password,
    }),
  });
  const data = await response.json(); // parse JSON body of res
  dispatch(setUser(data.user));
  return response;
};

// retain session user info across a refresh
export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

// logout
export const logout = () => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeUser());
  return response;
};

// REDUCER

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {

    case SET_USER:
      newState = Object.assign({}, state);
      newState.user = action.user;
      return newState;

    case REMOVE_USER:
      newState = Object.assign({}, state);
      newState.user = null;
      return newState;

    default:
      return state;
  }
};

export default sessionReducer;







// import { csrfFetch } from './csrf.js';

// {
//   user: {
//     id,
//       email,
//       username,
//       firstName,
//       lastName,
//       createdAt,
//       updatedAt
//   }
// }

// {
//   user: null
// }

// const SET_SESSION_USER = 'session/setSessionUser';
// const REMOVE_SESSION_USER = 'session/removeSessionUser';

// const loginSession = (user) => { // aka setSessionUser
//   return { // returns an action obj
//     type: SET_SESSION_USER,
//     user // do want payload
//   };
// };

// const logoutSession = () => { // id param?
//   return { // returns an action obj
//     type: REMOVE_SESSION_USER,
//     // id // no payload? not sure
//   };
// };

// export const loginSessionThunk = (user) => async (dispatch) => { // aka setSessionUserThunk
//   const response = await csrfFetch(`/api/session`, {
//     method: 'POST',
//     // headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       credential: user.credential, // username or email
//       password: user.password
//     })
//   });

//   const data = await response.json();
//   dispatch(loginSession(data.user));
//   return response;

//   // if (response.ok) {
//   //   const user = await response.json();
//   //   dispatch(setSessionUser(user));
//   //   return user;
//   // } else {
//   //   const errors = await response.json();
//   //   return errors;
//   // };
// };

// const initialState = { user: null };

// const sessionReducer = (state = initialState, action) => {
//   let newState;

//   switch (action.type) {
//     case SET_SESSION_USER:
//       newState = Object.assign({}, state);
//       newState.user = action.user;
//       return newState;

//     case REMOVE_SESSION_USER:
//       newState = Object.assign({}, state);
//       newState.user = null;
//       return newState;

//     default:
//       return state;
//   }
// };

// export default sessionReducer;
