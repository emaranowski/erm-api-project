// resources for route paths beginning in: /api/events
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();



// Get details of an Event specified by its id (GET /api/events/:eventId) -- V1
router.get('/:eventId', async (req, res) => {
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId,
        {
            include: [
                { model: Attendance },
                { model: Group },
                { model: Venue },
                { model: EventImage },
            ]
        }
    );

    // Error response: Couldn't find a Event with the specified id
    if (!event) {
        res.status(404);
        return res.json({ message: `Event couldn't be found` });
    }

    // convert to JSON
    // event = eventOrig.toJSON();

    // get numAttending
    let totalAttending;
    // const attendances = await Attendance.findAll(); // QUERY DB
    // const attendancesArr = attendances.filter(attendance => {
    //     return attendance.eventId === event.id;
    // });
    const attendancesArr = event.Attendances;
    totalAttending = attendancesArr.length;

    // get group
    const group = event.Group;
    const groupObj = {
        id: group.id,
        name: group.name,
        private: group.private,
        city: group.city,
        state: group.state
    }

    // get venue
    const venue = event.Venue;
    let venueVal;

    if (!venue) {
        venueVal = null;
    };

    if (venue) {
        venueVal = {
            id: venue.id,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            lat: venue.lat,
            lng: venue.lng
        }
    };

    // get event images
    let eventImagesArr = [];
    const eventImages = event.EventImages;
    eventImages.forEach(image => {
        const imageObj = {};
        imageObj.id = image.id;
        imageObj.url = image.url;
        imageObj.preview = image.preview;

        eventImagesArr.push(imageObj);
    });

    // // create organizerObj
    // let organizerObj = {};
    // const users = await User.findAll(); // QUERY DB
    // const usersArr = users.filter(user => {
    //     return user.id === event.organizerId;
    // });
    // const user = usersArr[0];
    // organizerObj.id = user.id;
    // organizerObj.firstName = user.firstName;
    // organizerObj.lastName = user.lastName;

    // // create venuesArr
    // let venuesArr = [];
    // const venuesArrOrig = event.Venues;
    // venuesArrOrig.forEach(venue => {
    //     const venueObj = {};
    //     venueObj.id = venue.id;
    //     venueObj.eventId = venue.eventId;
    //     venueObj.address = venue.address;
    //     venueObj.city = venue.city;
    //     venueObj.state = venue.state;
    //     venueObj.lat = venue.lat;
    //     venueObj.lng = venue.lng;

    //     venuesArr.push(venueObj);
    // });

    const eventObj = {
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        description: event.description,
        type: event.type,
        capacity: event.capacity,
        price: event.price,
        startDate: event.startDate,
        endDate: event.endDate,
        numAttending: totalAttending,
        Group: groupObj,
        Venue: venueVal,
        EventImages: eventImagesArr
    };
    res.status(200);
    return res.json(eventObj);
});




// Get all Events (GET /api/events) -- V2
router.get('/', async (req, res) => {
    let allEventsObj = { Events: [] };

    const eventsOrig = await Event.findAll({
        include: [
            { model: Attendance },
            { model: EventImage },
            { model: Group },
            { model: Venue }
        ]
    });

    // convert to JSON
    let events = [];
    eventsOrig.forEach(event => {
        events.push(event.toJSON());
    });

    events.forEach(event => {

        // 1. create + add numAttending
        const attendancesArr = event.Attendances;
        event.numAttending = attendancesArr.length;
        delete event.Attendances;

        // 2. create + add previewImage
        event.EventImages.forEach(image => {
            if (image.preview === true) {
                event.previewImage = image.url;
            };
        });
        if (!event.previewImage) {
            event.previewImage = 'No preview image found';
        };
        delete event.EventImages;
        delete event.description;
        delete event.capacity;
        delete event.price;

        // get group
        const group = event.Group;

        // get venue
        const venue = event.Venue;
        let venueVal;

        if (!venue) {
            venueVal = null;
        };

        if (venue) {
            venueVal = {
                id: venue.id,
                city: venue.city,
                state: venue.state
            }
        };

        // console.log('////////////////////////////////')
        // console.log(`***** group:`)
        // console.log(group)
        // console.log('////////////////////////////////')

        // console.log('////////////////////////////////')
        // console.log(`***** venue:`)
        // console.log(venue)
        // console.log('////////////////////////////////')

        event.Group = {
            id: group.id,
            name: group.name,
            city: group.city,
            state: group.state
        };

        event.Venue = venueVal;

        // 3. add event to allEventsObj
        allEventsObj.Events.push(event);
    });

    return res.json(allEventsObj);
});



module.exports = router;
