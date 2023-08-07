import { csrfFetch } from "./csrf";

////////////// Action Type Constants: //////////////

const GET_ALL_EVENTS = "events/GET_ALL_EVENTS";
const GET_SINGLE_EVENT = "events/GET_SINGLE_EVENT";
const CREATE_EVENT = "events/CREATE_EVENT";
const CREATE_EVENT_IMAGE = "events/CREATE_EVENT_IMAGE";
const UPDATE_EVENT = "events/UPDATE_EVENT";
const UPDATE_EVENT_IMAGE = "events/UPDATE_EVENT_IMAGE";
const DELETE_EVENT = "events/DELETE_EVENT";

////////////// Action Creators: //////////////

const getAllEvents = (events) => {
  return {
    type: GET_ALL_EVENTS,
    events
  };
};

const getSingleEvent = (event) => {
  return {
    type: GET_SINGLE_EVENT,
    event
  };
};

const createEvent = (event) => {
  return {
    type: CREATE_EVENT,
    event
  };
};

const createEventImage = (image) => {
  return {
    type: CREATE_EVENT_IMAGE,
    image
  };
};

const updateEvent = (event) => {
  return {
    type: UPDATE_EVENT,
    event
  };
};

// const updateEventImage = (image) => {
//   return {
//     type: UPDATE_EVENT_IMAGE,
//     image
//   };
// };

const deleteEvent = (eventId) => {
  return {
    type: DELETE_EVENT,
    eventId
  };
};

////////////// Thunk Action Creators: //////////////

////////////// Get All Events
export const getAllEventsThunk = () => async (dispatch) => {
  const res = await csrfFetch('/api/events', {
    method: 'GET'
  });

  if (res.ok) {
    const events = await res.json();
    const eventsArr = events.Events;

    return dispatch(getAllEvents(eventsArr));
  } else {
    const errors = await res.json();
    return errors;
  }
};

////////////// Get Single Event
export const getSingleEventThunk = (eventId) => async (dispatch) => {
  const res = await csrfFetch(`/api/events/${eventId}`);

  if (res.ok) {
    const eventDetails = await res.json();
    await dispatch(getSingleEvent(eventDetails));
    return eventDetails;
  } else {
    const errors = await res.json();
    return errors;
  }
};

// (POST /api/groups/:groupId/events)
////////////// Create Event + Create EventImage
export const createEventThunk = (event) => async (dispatch) => {
  const { groupId, venueId, name, type, capacity, price, description, startDate, endDate, url } = event;
  const preview = true;

  const res = await csrfFetch(`/api/groups/${groupId}/events`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      venueId,
      name,
      type,
      capacity,
      price,
      description,
      startDate,
      endDate,
    }),
  });

  if (res.ok) {

    const data = await res.json(); // data is event's obj { id: 4, ... } // need eventId (assigned by db)
    const eventId = data.id;

    dispatch(createEvent(data));

    const imageRes = await csrfFetch(`/api/events/${eventId}/images`, { // router.post('/:eventId/images'
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        url,
        preview,
      }),
    });

    if (imageRes.ok) {
      const image = await imageRes.json(); // image is eventImage obj
      // const imageId = image.id;

      const imageForStore = {
        id: image.id,
        eventId: eventId,
        url: image.url,
        preview: image.preview
      }

      dispatch(createEventImage(imageForStore));
    }

    return data;

  } else {
    const errors = await res.json();
    return errors;
  };
};

// (PUT /api/events/:eventId)
////////////// Update Event
export const updateEventThunk = (event) => async (dispatch) => {
  const { venueId, name, type, capacity, price, description, startDate, endDate, url, eventId } = event;
  const preview = true;

  const res = await csrfFetch(`/api/events/${eventId}`, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      venueId,
      name,
      type,
      capacity,
      price,
      description,
      startDate,
      endDate,
    }),
  });

  if (res.ok) {

    const data = await res.json(); // data is event's obj { id: 4, ... } // need eventId (assigned by db)
    dispatch(updateEvent(data));

    // const eventId = data.id;
    // const imageRes = await csrfFetch(`/api/events/${eventId}/images`, {
    //   method: "POST",
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     eventId,
    //     url,
    //     preview,
    //   }),
    // });
    // if (imageRes.ok) {
    //   const image = await imageRes.json(); // image is eventImage obj
    //   // const imageId = image.id;
    //   const imageForStore = {
    //     id: image.id,
    //     eventId: eventId,
    //     url: image.url,
    //     preview: image.preview
    //   }
    //   dispatch(updateEventImage(imageForStore));
    // }

    return data;

  } else {
    const errors = await res.json();
    return errors;
  };
};

// (DELETE /api/events/:eventId)
////////////// Delete Event
export const deleteEventThunk = (eventId) => async (dispatch) => {
  const res = await csrfFetch(`/api/events/${eventId}`, {
    method: "DELETE",
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(deleteEvent(eventId));
    return data;
  } else {
    const errors = await res.json();
    return errors;
  }
};


////////////// Reducer: //////////////

const initialState = { // 'events' slice holds obj with:
  allEvents: {}, // normalized kvps (loaded by all events route)
  singleEvent: {} // not normalized, but flattened db info (loaded by single event route)
};

export default function eventsReducer(state = initialState, action) { // eventsReducer must return events slice of state
  switch (action.type) {

    case GET_ALL_EVENTS: {
      const newState = { ...state, allEvents: {} };
      action.events.forEach(event => {
        newState.allEvents[event.id] = event;
      });
      return newState;
    }

    case GET_SINGLE_EVENT: {
      const newState = { ...state, singleEvent: {} };
      newState.singleEvent = action.event;
      return newState;
    }

    case CREATE_EVENT: {
      const newState = { ...state };
      newState.allEvents[action.event.id] = action.event;
      return newState;
    }

    case CREATE_EVENT_IMAGE: {
      const newState = { ...state };
      newState.singleEvent.EventImages = [];
      newState.singleEvent.EventImages.push(action.image);
      return newState;
    }

    case UPDATE_EVENT: {
      const newState = { ...state };
      newState.allEvents[action.event.id] = action.event;
      return newState;
    }

    case DELETE_EVENT: {
      const newState = { ...state };
      delete newState.allEvents[action.eventId];
      return newState;
    }

    default: {
      return state;
    }
  }
};
