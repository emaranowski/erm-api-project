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


  if (res.ok) {
    const groups = await res.json();

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

    const data = await res.json(); // data is group's obj { id: 4, ... } // need groupId (assigned by db)
    const groupId = data.id;

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

    if (imageRes.ok) {
      const image = await imageRes.json(); // image is groupImage obj
      // const imageId = image.id;

      const imageForStore = {
        id: image.id,
        groupId: groupId,
        url: image.url,
        preview: image.preview
      }

      dispatch(createGroupImage(imageForStore));
    }

    return data;

  } else {
    const errors = await res.json();
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

    const data = await res.json(); // data is group's obj { id: 4, ... } // need groupId (assigned by db)
    const groupId = data.id;


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

    if (imageRes.ok) {
      const image = await imageRes.json(); // image is groupImage obj
      // const imageId = image.id;

      const imageForStore = {
        id: image.id,
        groupId: groupId,
        url: image.url,
        preview: image.preview
      }

      dispatch(updateGroupImage(imageForStore));
    }

    return data;

  } else {
    const errors = await res.json();
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
    return data;
  } else {
    const errors = await res.json();
    return errors;
  }
};


// ORIG WORKING COPY -- DO NOT EDIT
// export const createGroupThunk = (group) => async (dispatch) => {

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

//   if (res.ok) {
//     const data = await res.json(); // need id assigned in backend database
//     dispatch(createGroup(data)); // removed .group
//     return data; // changed from res to data

//   } else {
//     const errors = await res.json();
//     return errors;
//   };
// };


// OLD -- can prob delete
// export const getOneGroupThunk = () => async (dispatch) => {
//   const res = await csrfFetch('/api/groups', {
//     method: 'GET'
//   });

//   if (res.ok) {
//     const groups = await res.json();

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
  switch (action.type) {

    case GET_ALL_GROUPS: {
      const newState = { ...state, allGroups: {} };
      action.groups.forEach(group => {
        newState.allGroups[group.id] = group;
      });
      return newState;
    }

    case GET_SINGLE_GROUP: {
      const newState = { ...state, singleGroup: {} };
      newState.singleGroup = action.group;
      return newState;
    }

    case CREATE_GROUP: {
      const newState = { ...state };
      newState.allGroups[action.group.id] = action.group;
      return newState;
    }

    case CREATE_GROUP_IMAGE: {
      const newState = { ...state, };
      newState.singleGroup.GroupImages = [];
      newState.singleGroup.GroupImages.push(action.image);
      return newState;
    }

    case UPDATE_GROUP: {
      const newState = { ...state };
      newState.allGroups[action.group.id] = action.group;
      return newState;
    }

    case UPDATE_GROUP_IMAGE: {
      const newState = { ...state };
      newState.singleGroup.GroupImages = [];
      newState.singleGroup.GroupImages.push(action.image);
      return newState;
    }

    case DELETE_GROUP: {
      const newState = { ...state };
      delete newState.allGroups[action.groupId];
      return newState;
    }

    default: {
      return state;
    }
  }
};

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
