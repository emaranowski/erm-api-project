// resources for route paths beginning in: /api/events
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();

// console.log('////////////////////////////////')
// console.log(`***** venue:`)
// console.log(venue)
// console.log('////////////////////////////////')




// Add an Image to an Event based on the Event's id (POST /api/events/:eventId/images)
router.post('/:eventId/images', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const userId = user.dataValues.id;
    const { url, preview } = req.body;
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId, { include: [{ model: Group }] });
    if (!event) {
        res.status(404);
        return res.json({ message: `Event couldn't be found` });
    };

    groupId = event.groupId;

    // Current User must be event host, co-host, or attendee
    const memberships = await Membership.findAll({ include: [{ model: Group }] });
    const canAddImage = memberships.filter(member => {
        return member.userId === userId &&
            member.groupId === groupId &&
            (member.status === 'host' ||
                member.status === 'co-host');
    });

    const attendance = await Attendance.findOne({ where: { userId: userId, eventId: eventId } });
    if (attendance) canAddImage.push('attendee');

    if (canAddImage.length === 0) {
        res.status(403);
        return res.json({
            message: `User must be an attendee, host, or co-host of the event to add an image.`
        });
    };

    await EventImage.bulkCreate([{ eventId, url, preview },],
        { validate: true });

    const createdImage = await EventImage.findOne({ // to get id
        where: { eventId, url, preview }
    });

    const createdImageObj = {
        id: createdImage.id,
        url: createdImage.url,
        preview: createdImage.preview
    };
    res.status(200);
    return res.json(createdImageObj);
});




// Delete attendance to an event specified by id (DELETE /api/events/:eventId/attendance)
// router.delete('/:eventId/attendance', requireAuth, async (req, res) => {
//     const { user } = req;
//     if (!user) {
//         res.status(401);
//         return res.json({ message: `Authentication Required. No user is currently logged in.` });
//     };

//     const userId = user.dataValues.id;
//     const { userIdToDelete } = req.body
//     const eventId = req.params.eventId;

//     // Error: no Event with specified id
//     const event = await Event.findByPk(eventId);
//     if (!event) {
//         res.status(404);
//         return res.json({ message: `Event couldn't be found` });
//     };



//     const attendanceToDelete = await Attendance.findOne({
//         where: {
//             userId: { [Op.eq]: [userId] },
//             eventId: { [Op.eq]: [eventId] }
//         }
//     });




//     // Current User must be host of group, or be user whose attendance is being deleted

// });




// Delete attendance to an event specified by id (DELETE /api/groups/:groupId/attendance)
// router.delete('/:eventId/attendance', requireAuth, async (req, res) => {
//     const { user } = req;
//     if (!user) {
//         res.status(401);
//         return res.json({ message: `Authentication Required. No user is currently logged in.` });
//     };

//     const eventId = req.params.eventId;
//     // Error: Couldn't find an Event with the specified id
//     const event = await Event.findByPk(eventId, { include: [{ model: Group }] });
//     // const event = await Event.findByPk(eventId,
//     //     {
//     //         include: [
//     //             { model: Group },
//     //             { model: Venue },
//     //         ]
//     //     }
//     // );
//     if (!event) {
//         res.status(404);
//         return res.json({ message: `Event couldn't be found` });
//     };

//     const userId = user.dataValues.id;
//     const groupId = event.Group.id;
//     const attendanceIdToDelete = req.body.userId;
//     const allAttendance = await Attendance.findAll();
//     const allMemberships = await Membership.findAll();

//     // Current User must be host of group, or be user whose attendance is being deleted

//     // create isHost
//     let isHost = false;
//     allMemberships.forEach(membership => {
//         if (
//             membership.userId === userId &&
//             membership.groupId === groupId &&
//             membership.status === 'host'
//         ) {
//             isHost = true;
//         }
//     });

//     // create isDeletingSelf
//     let isDeletingSelf = false;
//     allAttendance.forEach(attendance => {
//         if (
//             attendance.userId === userId &&
//             attendance.eventId === eventId &&
//             attendance.id === attendanceIdToDelete
//         ) {
//             isDeletingSelf = true;
//         }
//     });

//     // find event that matches userId + eventId
//     const attendanceToDelete = await Attendance.findByPk(attendanceIdToDelete
//         // { include: [{ model: User }, { model: Group }] }
//     );

//     console.log('////////////////////////////////')
//     console.log(`***** allAttendance:`)
//     console.log(allAttendance)
//     console.log('////////////////////////////////')

//     // DELETION HERE
//     if (isHost || isDeletingSelf) {

//         await attendanceToDelete.destroy();

//         res.status(200);
//         return res.json({ message: `Successfully deleted attendance from event` });
//     }

//     // Error: Attendance does not exist for this User
//     if (!attendanceToDelete) {
//         res.status(404);
//         return res.json({ message: `Attendance does not exist for this User` });
//     };

//     // Error: Only the User or organizer may delete an Attendance
//     if (!isHost && !isDeletingSelf) {
//         res.status(403);
//         return res.json({ message: `Only the User or organizer may delete an Attendance` });
//     };
// });




// Delete an Event (DELETE /api/events/:eventId)
router.delete('/:eventId', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const eventId = req.params.eventId;
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

    // Current user must be "host" or "co-host" of Group that Event belongs to
    const memberships = await Membership.findAll();
    const userId = user.dataValues.id;
    const groupId = event.Group.id;

    const hostOrCoHost = memberships.filter(member => {
        return member.userId === userId &&
            member.groupId === groupId &&
            (member.status === 'host' ||
                member.status === 'co-host');
    });

    if (hostOrCoHost.length === 0) {
        res.status(403);
        return res.json({
            message: `User must be a group's organizer or co-host to delete its events.`
        });
    };

    // console.log('////////////////////////////////')
    // console.log(`***** hostOrCoHost:`)
    // console.log(hostOrCoHost)
    // console.log('////////////////////////////////')

    await event.destroy();

    res.status(200);
    return res.json({ message: `Successfully deleted` });
});





// Get all Attendees of an Event specified by its id (GET /api/events/:eventId/attendees) -- V1
router.get('/:eventId/attendees', async (req, res) => {
    let attendeesObj = { Attendees: [] };

    const { user } = req;
    const currUserId = user.dataValues.id;
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);
    if (!event) {
        res.status(404);
        res.json({ message: `Event couldn't be found` })
    };

    const allAttendances = await Attendance.findAll({ where: { eventId: eventId } });
    const allUsers = await User.findAll();

    // create hostOrCoHost
    const hostOrCoHost = [];
    allAttendances.forEach(attendance => {

        if (attendance.userId === currUserId &&
            (attendance.status === 'host' || attendance.status === 'co-host')
        ) {
            hostOrCoHost.push(attendance.status)
        }
    });

    // If user IS host/co-host, show attendees w/ status: host, co-host, member, pending
    if (hostOrCoHost.length === 1) {

        allAttendances.forEach(attendance => {

            const user = allUsers.filter(user => {
                return user.id === attendance.dataValues.userId;
            });

            const attendeeObj = {
                id: attendance.id,
                firstName: user[0].dataValues.firstName,
                lastName: user[0].dataValues.lastName,
                Attendance: {
                    status: attendance.status
                }
            };

            attendeesObj.Attendees.push(attendeeObj);
        });
        res.status(200);
        return res.json(attendeesObj);
    };

    // If user IS NOT host/co-host, show attendances w/ status: attending, pending
    if (hostOrCoHost.length === 0) {

        allAttendances.forEach(attendance => {

            const user = allUsers.filter(user => {
                return user.id === attendance.dataValues.userId;
            });

            if (attendance.dataValues.status !== 'pending') {

                const attendeeObj = {
                    id: attendance.id,
                    firstName: user[0].dataValues.firstName,
                    lastName: user[0].dataValues.lastName,
                    Attendance: {
                        status: attendance.status
                    }
                };

                attendeesObj.Attendees.push(attendeeObj);
            };
        });
        res.status(200);
        return res.json(attendeesObj);
    };
});





// Request to Attend an Event based on the Event's id (POST /api/events/:eventId/attendance)
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);
    if (!event) {
        res.status(404);
        return res.json({ message: `Event couldn't be found` });
    };

    const existingAttendance = await Attendance.findOne({
        where: { userId: currUserId, eventId: eventId }
    });

    // console.log('////////////////////////////////')
    // console.log(`***** existingAttendance:`)
    // console.log(existingAttendance.status)
    // console.log('////////////////////////////////')

    if (!existingAttendance) {
        await Attendance.bulkCreate([{
            userId: currUserId,
            eventId: eventId,
            status: 'pending'
        }], { validate: true });

        const createdMember = await Attendance.findOne({
            where: {
                userId: currUserId,
                eventId: eventId,
                status: 'pending'
            }
        });

        const newAttendanceObj = {
            eventId: createdMember.eventId,
            memberId: createdMember.id,
            status: createdMember.status
        };

        res.status(200);
        return res.json(newAttendanceObj);
    };

    if (existingAttendance.status === 'pending') {
        res.status(400);
        return res.json({ message: `Attendance has already been requested (pending)` });
    };

    if (existingAttendance.status !== 'pending') {
        res.status(400);
        return res.json({ message: `User is already an attendee of the event` });
    };
});






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

    // const membersArr = event.Memberships;

    const memberships = await Membership.findAll();

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
