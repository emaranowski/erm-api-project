import { csrfFetch } from "./csrf";

////////////// Action Type Constants: //////////////

const GET_ALL_EVENTS = "events/GET_ALL_EVENTS";
const GET_SINGLE_EVENT = "events/GET_SINGLE_EVENT";
const CREATE_EVENT = "events/CREATE_EVENT";
const CREATE_EVENT_IMAGE = "events/CREATE_EVENT_IMAGE";

////////////// Action Creators: //////////////

const getAllEvents = (events) => {
  // console.log(`*** in getAllEvents events is: ***`, events) // EVENTS IS REACHING HERE
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

////////////// Thunk Action Creators: //////////////

////////////// Get All Events
export const getAllEventsThunk = () => async (dispatch) => {
  const res = await csrfFetch('/api/events', {
    method: 'GET'
  });

  // console.log(`*** in GET ALL EVENTS THUNK, res is: ***`, res) // Res obj

  if (res.ok) {
    const events = await res.json();
    const eventsArr = events.Events;

    // console.log(`*** in GET ALL EVENTS RES.OK, events is: ***`, events) // obj -- { Events: [ 0: { id: 1, ... }, 1: { id: 2, ... } ] }
    // console.log(`*** in GET ALL EVENTS RES.OK, eventsArr is: ***`, eventsArr) // arr -- [ 0: { id: 1, ... }, 1: { id: 2, ... } ]

    // console.log(`*** events obj is: ***`, events) // obj, w/ Events key
    // console.log(`*** events.Events is: ***`, events.Events) // arr of all 3 events
    // console.log(`*** dispatch is: ***`, dispatch(getAllEvents(events.Events)))
    // ^ returns obj w/ keys: type, events: []

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
    dispatch(getSingleEvent(eventDetails));
    // return eventDetails; // 2023-08-03 tried adding return
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
    // console.log(`*** in res.ok ***`)

    const data = await res.json(); // data is event's obj { id: 4, ... } // need eventId (assigned by db)
    const eventId = data.id;

    // console.log(`*** in res.ok -- data is: ***`, data) // event's obj { id: 4, ... }
    // console.log(`*** in res.ok -- eventId is: ***`, eventId) // 4

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
    // console.log(`*** in thunk res.ok -- imageRes is: ***`, imageRes) // Response obj {}

    if (imageRes.ok) {
      // console.log(`*** in imageRes.ok -- imageRes is: ***`, imageRes) // Response obj {}
      const image = await imageRes.json(); // image is eventImage obj
      // const imageId = image.id;
      // console.log(`*** in imageRes.ok -- image is: ***`, image) //
      // console.log(`*** in imageRes.ok -- imageId is: ***`, imageId) //

      const imageForStore = {
        id: image.id,
        eventId: eventId,
        url: image.url,
        preview: image.preview
      }
      // console.log(`*** in imageRes.ok -- imageForStore is: ***`, imageForStore) //

      dispatch(createEventImage(imageForStore));
    }

    return data;

  } else {
    console.log(`*** in thunk RES NOT OK ***`)
    const errors = await res.json();
    console.log(`*** in thunk RES NOT OK -- errors is: ***`, errors)
    return errors;
  };
};


////////////// Reducer: //////////////

const initialState = { // 'events' slice holds obj with:
  allEvents: {}, // normalized kvps (loaded by all events route)
  singleEvent: {} // not normalized, but flattened db info (loaded by single event route)
};

export default function eventsReducer(state = initialState, action) { // eventsReducer must return events slice of state
  let newState = { ...state };

  switch (action.type) {

    case GET_ALL_EVENTS:
      // console.log(`*** action.events is: ***`, action.events) // looks correct
      action.events.forEach(event => {
        newState.allEvents[event.id] = event;
      });
      // console.log(`*** newState is: ***`, newState) // looks correct
      return newState;

    case GET_SINGLE_EVENT:
      newState.singleEvent = action.event;
      return newState;

    case CREATE_EVENT:
      newState.allEvents[action.event.id] = action.event;
      return newState;

    case CREATE_EVENT_IMAGE:
      newState.singleEvent.EventImages = [];
      newState.singleEvent.EventImages.push(action.image);
      return newState;

    default:
      return state
  }
};
