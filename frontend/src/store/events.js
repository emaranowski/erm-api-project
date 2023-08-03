import { csrfFetch } from "./csrf";

////////////// Action Type Constants: //////////////

const GET_ALL_EVENTS = "events/GET_ALL_EVENTS";

////////////// Action Creators: //////////////

const getAllEvents = (events) => {

    // console.log(`*** in getAllEvents events is: ***`, events) // EVENTS IS REACHING HERE

    return {
        type: GET_ALL_EVENTS,
        events
    };
};

////////////// Thunk Action Creators: //////////////

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

        default:
            return state
    }
};
