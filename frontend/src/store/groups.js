

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

export default function groupReducer(state, action) { // groupReducer must return groups slicec of state
    switch (action.type) {
        default:
            return state
    }
}


let normalized = {
    1: { id: 1, ... },
    [name]: { name: 'Jessie', ... }
}

let flattened = {
    // no nested keys, all data is at top level
}
