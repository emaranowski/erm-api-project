import { csrfFetch } from "./csrf";

// Action Type Constants:

const GET_ALL_GROUPS = "groups/GET_ALL_GROUPS";
const GET_SINGLE_GROUP = "groups/GET_SINGLE_GROUP";

// Action Creators:

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

// Thunk Action Creators:

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

// export const getOneGroupThunk = () => async (dispatch) => {
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

// Reducer:

const initialState = {
  allGroups: {
    // normalized kvps
    // loaded by all groups route
  },
  singleGroup: {
    // not normalized, but flattened db info
    // loaded by single group route
  }
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

    default:
      return state
  }
}


// groups: {
//   allGroups: {
//     [groupId]: {
//       groupData,
//       },
//     optionalOrderedList: [],
//     },
//   singleGroup: {
//     groupData,
//       GroupImages: [imagesData],
//         Organizer: {
//       organizerData,
//       },
//     Venues: [venuesData],
//     },
// },


// let normalized = {
//     1: { id: 1, ... },
//     [name]: { name: 'Jessie', ... }
// }

// let flattened = {
//     // no nested keys, all data is at top
// }
