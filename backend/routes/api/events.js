// resources for route paths beginning in: /api/events
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();



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
