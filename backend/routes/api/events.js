// resources for route paths beginning in: /api/events
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();


const validateEvent = [
    // check('venueId')
    //     // .exists({ checkFalsy: true })
    //     .custom(async value => { // prob need custom
    //         const venue = await Venue.findByPk(venueId);
    //         if (!venue) {
    //             throw new Error(`Venue does not exist`); // this is not triggering
    //         };
    //     })
    //     // .withMessage(`Venue does not exist`), // this is triggering in all cases
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage(`Name must be at least 5 characters`),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In person'])
        .withMessage(`Type must be 'Online' or 'In person'`),
    check('capacity')
        .exists({ checkFalsy: true })
        .isInt()
        .withMessage(`Capacity must be an integer`),
    check('price')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage(`Price is invalid`),
    check('description')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Description is required`),
    // check('startDate')
    //     .exists({ checkFalsy: true })
    //     .isAfter('CURRENT_TIMESTAMP') // not sure correct
    //     .withMessage(`Start date must be in the future`),
    // check('endDate')
    //     .exists({ checkFalsy: true })
    //     .isAfter('startDate') // not sure correct
    //     .withMessage(`End date must be after start date`),
    handleValidationErrors
]; // if any one is wrong, err is ret as res


// Edit an Event specified by its id (PUT /api/events/:eventId)
router.put('/:eventId', requireAuth, validateEvent, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const userId = user.dataValues.id;
    const eventId = req.params.eventId;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    const event = await Event.findByPk(eventId,
        {
            include: [
                { model: Group },
                { model: Venue },
            ]
        }
    );

    if (!event) {
        res.status(404);
        return res.json({ message: `Event couldn't be found` });
    };

    const venue = event.Venue;
    if (!venue) {
        res.status(400);
        return res.json({ message: `Venue does not exist` });
    };

    const groupId = event.Group.groupId;

    // get membership
    // const membership = await Membership.findOne({
    //     where: {
    //         userId: userId,
    //         groupId: groupId,
    //         status: {
    //             [Op.in]: ['host', 'co-host']
    //         }
    //     }
    // });

    const memberships = await Membership.findAll();

    // const membersArr = event.Memberships;

    const hostOrCoHost = memberships.filter(member => {
        return member.userId === userId &&
            member.groupId === groupId &&
            (member.status === 'host' ||
                member.status === 'co-host');
    });

    // Current user must be "host" or "co-host" of Group that Event belongs to
    if (hostOrCoHost.length === 0) {
        res.status(403);
        return res.json({
            message: `User must be a group's organizer or co-host to update its events.`
        });
    };

    event.venueId = venueId;
    event.name = name;
    event.type = type;
    event.capacity = capacity;
    event.price = price;
    event.description = description;
    event.startDate = startDate;
    event.endDate = endDate;
    await event.save();

    const eventObj = {
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        type: event.type,
        capacity: event.capacity,
        price: event.price,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
    };
    res.status(200);
    return res.json(eventObj);
});


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
