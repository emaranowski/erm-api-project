import { csrfFetch } from "./csrf";

////////////// Action Type Constants: //////////////

const GET_ALL_GROUPS = "groups/GET_ALL_GROUPS";
const GET_SINGLE_GROUP = "groups/GET_SINGLE_GROUP";
const CREATE_GROUP = "groups/CREATE_GROUP";
const CREATE_GROUP_IMAGE = "groups/CREATE_GROUP_IMAGE";
const UPDATE_GROUP = "groups/UPDATE_GROUP";
const UPDATE_GROUP_IMAGE = "groups/UPDATE_GROUP_IMAGE";
const DELETE_GROUP = "groups/DELETE_GROUP";

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

const createGroupImage = (image) => {
  return {
    type: CREATE_GROUP_IMAGE,
    image
  };
};

const updateGroup = (group) => {
  return {
    type: UPDATE_GROUP,
    group
  };
};

const updateGroupImage = (image) => {
  return {
    type: UPDATE_GROUP_IMAGE,
    image
  };
};

const deleteGroup = (groupId) => {
  return {
    type: DELETE_GROUP,
    groupId
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

    // console.log(`*** in GET ALL groups RES.OK, groups is: ***`, groups) // obj -- { Groups: [ 0: { id: 1, ... }, 1: { id: 2, ... } ] }
    // console.log(`*** in GET ALL groups RES.OK, groups.Groups is: ***`, groups.Groups) // arr -- [ 0: { id: 1, ... }, 1: { id: 2, ... } ]


    return dispatch(getAllGroups(groups.Groups)); // groups.Groups is arr
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
    // return groupDetails // 2023-08-03 tried adding return
  } else {
    const errors = await res.json();
    return errors;
  }
};

export const createGroupThunk = (group) => async (dispatch) => {
  const { city, state, name, about, type, privacy, url } = group;
  const preview = true;

  const res = await csrfFetch("/api/groups", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city,
      state,
      name,
      about,
      type,
      privacy,
    }),
  });

  if (res.ok) {
    // console.log(`*** in res.ok ***`)

    const data = await res.json(); // data is group's obj { id: 4, ... } // need groupId (assigned by db)
    const groupId = data.id;

    // console.log(`*** in res.ok -- data is: ***`, data) // group's obj { id: 4, ... }
    // console.log(`*** in res.ok -- groupId is: ***`, groupId) // 4

    dispatch(createGroup(data));

    const imageRes = await csrfFetch(`/api/groups/${groupId}/images`, { // router.post('/:groupId/images'
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        url,
        preview,
      }),
    });
    // console.log(`*** in thunk res.ok -- imageRes is: ***`, imageRes) // Response obj {}

    if (imageRes.ok) {
      // console.log(`*** in imageRes.ok -- imageRes is: ***`, imageRes) // Response obj {}
      const image = await imageRes.json(); // image is groupImage obj
      // const imageId = image.id;
      // console.log(`*** in imageRes.ok -- image is: ***`, image) //
      // console.log(`*** in imageRes.ok -- imageId is: ***`, imageId) //

      const imageForStore = {
        id: image.id,
        groupId: groupId,
        url: image.url,
        preview: image.preview
      }
      // console.log(`*** in imageRes.ok -- imageForStore is: ***`, imageForStore) //

      dispatch(createGroupImage(imageForStore));
    }

    return data;

  } else {
    console.log(`*** in thunk RES NOT OK ***`)
    const errors = await res.json();
    console.log(`*** in thunk RES NOT OK -- errors is: ***`, errors)
    return errors;
  };
};

export const updateGroupThunk = (group) => async (dispatch) => {
  const { city, state, name, about, type, privacy, url, groupId } = group;
  const preview = true;

  const res = await csrfFetch(`/api/groups/${groupId}`, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city,
      state,
      name,
      about,
      type,
      privacy,
    }),
  });

  if (res.ok) {
    // console.log(`*** in res.ok ***`)

    const data = await res.json(); // data is group's obj { id: 4, ... } // need groupId (assigned by db)
    const groupId = data.id;

    // console.log(`*** in res.ok -- data is: ***`, data) // group's obj { id: 4, ... }
    // console.log(`*** in res.ok -- groupId is: ***`, groupId) // 4

    dispatch(updateGroup(data));

    const imageRes = await csrfFetch(`/api/groups/${groupId}/images`, { // router.post('/:groupId/images'
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        url,
        preview,
      }),
    });
    // console.log(`*** in thunk res.ok -- imageRes is: ***`, imageRes) // Response obj {}

    if (imageRes.ok) {
      // console.log(`*** in imageRes.ok -- imageRes is: ***`, imageRes) // Response obj {}
      const image = await imageRes.json(); // image is groupImage obj
      // const imageId = image.id;
      // console.log(`*** in imageRes.ok -- image is: ***`, image) //
      // console.log(`*** in imageRes.ok -- imageId is: ***`, imageId) //

      const imageForStore = {
        id: image.id,
        groupId: groupId,
        url: image.url,
        preview: image.preview
      }
      // console.log(`*** in imageRes.ok -- imageForStore is: ***`, imageForStore) //

      dispatch(updateGroupImage(imageForStore));
    }

    return data;

  } else {
    console.log(`*** in thunk RES NOT OK ***`)
    const errors = await res.json();
    console.log(`*** in thunk RES NOT OK -- errors is: ***`, errors)
    return errors;
  };
};

// (DELETE /api/groups/:groupId)
export const deleteGroupThunk = (groupId) => async (dispatch) => {
  const res = await csrfFetch(`/api/groups/${groupId}`, {
    method: "DELETE",
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(deleteGroup(groupId));
    console.log(`*** in delete thunk, data is: ***`, data) // {message: 'Successfully deleted'}
    return data;
  } else {
    const errors = await res.json();
    console.log(`*** in delete thunk, errors is: ***`, errors) //
    return errors;
  }
};


// ORIG WORKING COPY -- DO NOT EDIT
// export const createGroupThunk = (group) => async (dispatch) => {
//   // console.log(`*** group is: ***`, group) // 'group' DOES PRINT

//   // 'privacy' does not match 'private' key in db ????
//   // const private = privacy; // gives err: private is a reserved word in strict mode
//   const { city, state, name, about, type, privacy } = group;
//   const res = await csrfFetch("/api/groups", {
//     method: "POST",
//     headers: { 'Content-Type': 'application/json' },
//     // body: JSON.stringify(group),
//     body: JSON.stringify({
//       city,
//       state,
//       name,
//       about,
//       type,
//       privacy, // commented back in after changing from 'private' to 'privacy'
//     }),
//   });

//   // console.log(`*** res is: ***`, res)
//   // console.log(`*** res.body is: ***`, res.body)

//   if (res.ok) {
//     // console.log(`*** in res.ok ***`)
//     const data = await res.json(); // need id assigned in backend database
//     // console.log(`*** in res.ok -- data is: ***`, data)
//     // console.log(`*** group is: ***`, group)
//     dispatch(createGroup(data)); // removed .group
//     return data; // changed from res to data

//   } else {
//     console.log(`*** in RES NOT OK ***`)
//     const errors = await res.json();
//     console.log(`*** errors is: ***`, errors)
//     return errors;
//   };
// };


// OLD -- can prob delete
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


////////////// Reducer: //////////////

const initialState = { // 'groups' slice holds obj with:
  allGroups: {}, // normalized kvps (loaded by all groups route)
  singleGroup: {} // not normalized, but flattened db info (loaded by single group route)
}

export default function groupsReducer(state = initialState, action) { // groupReducer must return groups slice of state
  let newState = { ...state };

  switch (action.type) {

    case GET_ALL_GROUPS:
      action.groups.forEach(group => {
        newState.allGroups[group.id] = group;
      });
      return newState;

    case GET_SINGLE_GROUP:
      newState.singleGroup = action.group;
      return newState;

    case CREATE_GROUP:
      newState.allGroups[action.group.id] = action.group;
      return newState;

    case CREATE_GROUP_IMAGE:
      // console.log(`*** in case CREATE_GROUP_IMAGE -- newState.singleGroup: ***`, newState.singleGroup) // group obj {}
      // console.log(`**************`)
      // console.log(`*** in case CREATE_GROUP_IMAGE -- newState.singleGroup.GroupImages1: ***`, newState.singleGroup.GroupImages) // undefined
      newState.singleGroup.GroupImages = [];
      // console.log(`*** in case CREATE_GROUP_IMAGE -- newState.singleGroup.GroupImages2: ***`, newState.singleGroup.GroupImages) // []
      newState.singleGroup.GroupImages.push(action.image);
      // console.log(`*** in case CREATE_GROUP_IMAGE -- newState.singleGroup.GroupImages3: ***`, newState.singleGroup.GroupImages) // arr of image objs [{ id: 4, ...}]
      // console.log(action.image)
      return newState;

    case UPDATE_GROUP:
      newState.allGroups[action.group.id] = action.group;
      return newState;

    case UPDATE_GROUP_IMAGE:
      newState.singleGroup.GroupImages = [];
      newState.singleGroup.GroupImages.push(action.image);
      return newState;

    // case UPDATE_GROUP_IMAGE:
    //   newState.singleGroup.GroupImages = [];
    //   newState.singleGroup.GroupImages[0] = action.image;
    //   return newState;

    case DELETE_GROUP:
      delete newState.allGroups[action.groupId];
      // delete newState.singleGroup...CREATE_GROUP.at. // need JS to check if singleGroup.id === action.groupId?
      return newState;

    default:
      return state
  }
}

////////////// NOTES: //////////////

// groups: {

//   allGroups: {
//     [groupId]: {
//       groupData,
//     },
//     optionalOrderedList: [],
//   },

//   singleGroup: {
//     groupData,
//     GroupImages: [imagesData],
//     Organizer: {
//       organizerData,
//     },
//     Venues: [venuesData],
//   },

// },

// let normalized = {
//     1: { id: 1, ... },
//     [name]: { name: 'Jessie', ... }
// }

// let flattened = {
//     // no nested keys, all data is at top
// }
