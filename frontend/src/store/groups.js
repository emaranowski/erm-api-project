import { csrfFetch } from "./csrf";

////////////// Action Type Constants: //////////////

const GET_ALL_GROUPS = "groups/GET_ALL_GROUPS";
const GET_SINGLE_GROUP = "groups/GET_SINGLE_GROUP";
const CREATE_GROUP = "groups/CREATE_GROUP";

////////////// Action Creators: //////////////

const getAllGroups = (groups) => {
  return {
    type: GET_ALL_GROUPS,
    groups
  };
};

const getSingleGroup = (group) => {
  return {
    type: GET_SINGLE_GROUP,
    group
  };
};

const createGroup = (group) => {
  return {
    type: CREATE_GROUP,
    group
  };
};

////////////// Thunk Action Creators: //////////////

export const getAllGroupsThunk = () => async (dispatch) => {
  const res = await csrfFetch('/api/groups', {
    method: 'GET'
  });

  // console.log(`*** res is: ***`, res) // type: res?

  if (res.ok) {
    const groups = await res.json();

    // console.log(`*** groups obj is: ***`, groups) // obj, w/ Groups key
    // console.log(`*** groups.Groups is: ***`, groups.Groups) // arr of all 3 groups
    // console.log(`*** dispatch is: ***`, dispatch(getAllGroups(groups.Groups)))
    // ^ returns obj w/ keys: type, groups: []

    return dispatch(getAllGroups(groups.Groups));
  } else {
    const errors = await res.json();
    return errors;
  }
};

export const getSingleGroupThunk = (groupId) => async (dispatch) => {
  const res = await csrfFetch(`/api/groups/${groupId}`);

  if (res.ok) {
    const groupDetails = await res.json();
    dispatch(getSingleGroup(groupDetails));
  } else {
    const errors = await res.json();
    return errors;
  }
};

export const createGroupThunk = (group) => async (dispatch) => {
  // console.log(`*** group is: ***`, group) // 'group' DOES PRINT

  // 'privacy' does not match 'private' key in db ????
  // const private = privacy; // gives err: private is a reserved word in strict mode
  const { city, state, name, about, type, privacy } = group;
  const res = await csrfFetch("/api/groups", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    // body: JSON.stringify(group),
    body: JSON.stringify({
      city,
      state,
      name,
      about,
      type,
      privacy, // commented back in after changing from 'private' to 'privacy'
    }),
  });

  // console.log(`*** res is: ***`, res)
  // console.log(`*** res.body is: ***`, res.body)

  if (res.ok) {
    // console.log(`*** in res.ok ***`)
    const data = await res.json(); // need id assigned in backend database
    // console.log(`*** in res.ok -- data is: ***`, data)
    // console.log(`*** group is: ***`, group)
    dispatch(createGroup(data)); // removed .group
    return data; // changed from res to data

  } else {
    console.log(`*** in RES NOT OK ***`)
    const errors = await res.json();
    console.log(`*** errors is: ***`, errors)
    return errors;
  };
};

// export const getOneGroupThunk = () => async (dispatch) => { // -- OLD
//   const res = await csrfFetch('/api/groups', {
//     method: 'GET'
//   });

//   // console.log(`*** res is: ***`, res) // type: res?

//   if (res.ok) {
//     const groups = await res.json();

//     // console.log(`*** groups obj is: ***`, groups) // obj, w/ Groups key
//     // console.log(`*** groups.Groups is: ***`, groups.Groups) // arr of all 3 groups
//     // console.log(`*** dispatch is: ***`, dispatch(getAllGroups(groups.Groups)))
//     // ^ returns obj w/ keys: type, groups: []

//     return dispatch(getAllGroups(groups.Groups));
//   } else {
//     const errors = await res.json();
//     return errors;
//   }
// };

////////////// Reducer: //////////////

const initialState = { // 'groups' slice holds obj with:
  allGroups: {}, // normalized kvps (loaded by all groups route)
  singleGroup: {} // not normalized, but flattened db info (loaded by single group route)
}

export default function groupsReducer(state = initialState, action) { // groupReducer must return groups slice of state
  let newState;

  switch (action.type) {

    case GET_ALL_GROUPS:
      newState = { ...state };
      // console.log(action.groups)
      action.groups.forEach(group => {
        newState.allGroups[group.id] = group;
      });
      return newState;

    case GET_SINGLE_GROUP:
      newState = { ...state };

      newState.singleGroup = action.group;
      // console.log(action.group)

      return newState;

    case CREATE_GROUP:
      newState = { ...state };

      newState.allGroups[action.group.id] = action.group;
      // console.log(action.group.id)

      return newState;

    default:
      return state
  }
}

////////////// NOTES: //////////////

// let normalized = {
//     1: { id: 1, ... },
//     [name]: { name: 'Jessie', ... }
// }

// let flattened = {
//     // no nested keys, all data is at top
// }
