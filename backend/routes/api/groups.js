// resources for route paths beginning in: /api/groups
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();

const validateEvent = [
    check('venueId')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Venue cannot be empty`),
    check('venueId')
        .exists({ checkFalsy: true })
        .isInt()
        .withMessage(`Venue must be an integer`),
    check('venueId')
        .exists({ checkFalsy: true })
        .custom(async value => {
            const venue = await Venue.findByPk(value);
            if (!venue) throw new Error();
        })
        .withMessage(`Venue does not exist`),
    // check('venueId')
    //     // .exists({ checkFalsy: true })
    //     .custom(async value => { // prob need custom
    //         const venue = await Venue.findByPk(venueId);
    //         if (!venue) {
    //             throw new Error(`Venue does not exist`); // this is not triggering
    //         };
    //     })
    //     // .withMessage(`Venue does not exist`), // this is triggering in all cases
    // check('venueId')
    //     // .exists({ checkFalsy: true })
    //     .custom(async value => {
    //         if (!value) {
    //             throw new Error();
    //         }
    //     })
    //     .withMessage(`Venue does not exist`),
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
    check('startDate')
        .exists({ checkFalsy: true })
        .isAfter(Date.parse(Date.now()))
        .withMessage(`Start date must be in the future`),
    check('endDate')
        .exists({ checkFalsy: true })
        .isAfter(Date.parse(this.startDate))
        .withMessage(`End date must be after start date`),
    // check('startDate')
    //     .exists({ checkFalsy: true })
    //     .isAfter(Date.now()) // not sure correct
    //     .withMessage(`Start date must be in the future`),
    // check('endDate')
    //     .exists({ checkFalsy: true })
    //     .isAfter('startDate') // not sure correct
    //     .withMessage(`End date must be after start date`),
    handleValidationErrors
]; // if any one is wrong, err is ret as res

// app.post('/signup', body('email') // EXAMPLE OF CUSTOM VALIDATOR
//     .custom(async value => {
//         const existingUser = await Users.findUserByEmail(value);
//         if (existingUser) {
//             throw new Error('E-mail already in use');
//         }
//     })
//     , (req, res) => {
//         // Handle request
//     }
// );







// Create an Event for a Group specified by its id (POST /api/groups/:groupId/events) -- DRAFT V1
// To create event, current User must be group organizer or "co-host"
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res) => {
    const { user } = req;
    if (!user) { // should not run, since requireAuth should catch issues first (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) { // 404 Error: Couldn't find Group with specified id
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // find all group memberships where userId: currUserId
    const hostOrCoHost = await Membership.findAll({
        where: {
            userId: currUserId,
            groupId: groupId,
            status: { [Op.in]: ['host', 'co-host'] }
        }
    });

    if (hostOrCoHost.length === 0) {
        res.status(403); // 403 Not Authorized: User must be group organizer or co-host to create an event
        return res.json({ message: `Forbidden: User must be group organizer or co-host to create an event` });
    };

    // COME BACK TO THIS
    // if (!(currUserId === group.organizerId) && !userIsCoHost) { // if either is false
    //     res.status(403);
    //     return res.json({ message: `User must be a group organizer or co-host to add an event.` });
    // };

    // if ((currUserId === group.organizerId) || userIsCoHost) { // if either is true
    //     await Event.bulkCreate([{ groupId, address, city, state, lat, lng }],
    //         { validate: true });
    // };

    await Event.bulkCreate([{
        venueId, groupId, name, type, capacity, price, description, startDate, endDate
    }], { validate: true });

    const createdGroupEvent = await Event.findOne({ // to get createdGroupEvent.id
        where: { venueId, groupId, name, type, capacity, price, description, startDate, endDate }
    });

    const eventObj = {};
    eventObj.id = createdGroupEvent.id;
    eventObj.groupId = createdGroupEvent.groupId;
    eventObj.venueId = createdGroupEvent.venueId;
    eventObj.name = createdGroupEvent.name;
    eventObj.type = createdGroupEvent.type;
    eventObj.capacity = createdGroupEvent.capacity;
    eventObj.price = createdGroupEvent.price;
    eventObj.description = createdGroupEvent.description;
    eventObj.startDate = createdGroupEvent.startDate;
    eventObj.endDate = createdGroupEvent.endDate;

    res.status(200);
    return res.json(eventObj);


    // const memberId = req.body.memberId; // -- from body
    // const membership = await Membership.findByPk(memberId); // membership to delete

    // // create isHost
    // let isHost = false;
    // const currUserHostMembership = await Membership.findOne({
    //     where: {
    //         userId: currUserId,
    //         groupId: groupId,
    //         status: 'host'
    //     }
    // });
    // if (currUserHostMembership) isHost = true;







    // // const hostOrCoHost = [];
    // allMemberships.forEach(membership => {
    //     // console.log('////////////////////////////////')
    //     // console.log(`***** membership.status:`)
    //     // console.log(membership.status)
    //     // console.log('////////////////////////////////')

    //     // console.log('////////////////////////////////')
    //     // console.log(`***** groupId:`)
    //     // console.log(groupId)
    //     // console.log('////////////////////////////////')

    //     if (membership.userId === currUserId &&
    //         (membership.status === 'host' || membership.status === 'co-host')
    //     ) {
    //         hostOrCoHost.push(membership.status)
    //     }
    // });
});




// FEEDBACK
// seems like the ids stored here do not match with actual users who are members.
// Subsequently, this hinders a host user to change attendance status of a test user.
// Delete endpoints seem to work, but could not confirm (GET all attendees did not return any body, due to lack of seed data)
// SHOULD BE FINE / NOT ACTUALLY AN ISSUE:
// have to be logged in as host/co-host to view all members of group
// if group only has pending members, will appear empty
// Get all Members of a Group specified by its id (GET /api/groups/:groupId/members) -- V1
router.get('/:groupId/members', async (req, res) => {
    let groupMembersObj = { Members: [] };

    const { user } = req;
    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;

    const group = await Group.findByPk(groupId);
    if (!group) {
        res.status(404);
        res.json({ message: `Group couldn't be found` })
    };

    const allMemberships = await Membership.findAll({ where: { groupId: groupId } });
    const allUsers = await User.findAll();

    // console.log('////////////////////////////////')
    // console.log(`***** allMemberships:`)
    // console.log(allMemberships)
    // console.log('////////////////////////////////')

    // create hostOrCoHost
    const hostOrCoHost = [];
    allMemberships.forEach(membership => {
        // console.log('////////////////////////////////')
        // console.log(`***** membership.status:`)
        // console.log(membership.status)
        // console.log('////////////////////////////////')

        // console.log('////////////////////////////////')
        // console.log(`***** groupId:`)
        // console.log(groupId)
        // console.log('////////////////////////////////')

        if (membership.userId === currUserId &&
            (membership.status === 'host' || membership.status === 'co-host')
        ) {
            hostOrCoHost.push(membership.status)
        }
    });

    // console.log('////////////////////////////////')
    // console.log(`***** hostOrCoHost:`)
    // console.log(hostOrCoHost)
    // console.log('////////////////////////////////')

    // If user IS host/co-host, show members w/ status: host, co-host, member, pending
    if (hostOrCoHost.length === 1) {

        allMemberships.forEach(member => {

            const user = allUsers.filter(user => {
                return user.id === member.dataValues.userId;
            });

            // console.log('////////////////////////////////')
            // console.log(`***** user:`)
            // console.log(user)
            // console.log('////////////////////////////////')

            const memberObj = {
                id: member.id,
                firstName: user[0].dataValues.firstName,
                lastName: user[0].dataValues.lastName,
                Membership: {
                    status: member.status
                }
            };

            groupMembersObj.Members.push(memberObj);
        });
        res.status(200);
        return res.json(groupMembersObj);
    };

    // If user IS NOT host/co-host, show members w/ status: host, co-host, member
    if (hostOrCoHost.length === 0) {

        allMemberships.forEach(member => {

            const user = allUsers.filter(user => {
                return user.id === member.dataValues.userId;
            });

            if (member.dataValues.status !== 'pending') {

                const memberObj = {
                    id: member.id,
                    firstName: user[0].dataValues.firstName,
                    lastName: user[0].dataValues.lastName,
                    Membership: {
                        status: member.status
                    }
                };

                groupMembersObj.Members.push(memberObj);
            };
        });
        res.status(200);
        return res.json(groupMembersObj);
    };
});




// Get all Events of a Group specified by its id (GET /api/groups/:groupId/events) -- V1
router.get('/:groupId/events', async (req, res) => {
    let groupEventsObj = { Events: [] };

    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId,
        { include: [{ model: Event }] }
    );

    if (!group) {
        res.status(404);
        res.json({ message: `Group couldn't be found` })
    };

    // const groupEventsArrOrig = await Event.findAll({
    //     where: { groupId: groupId }
    // });

    const allAttendances = await Attendance.findAll();
    const allEventImages = await EventImage.findAll();
    const allVenues = await Venue.findAll();

    group.Events.forEach(event => {

        // console.log('////////////////////////////////')
        // console.log(`***** event:`)
        // console.log(event)
        // console.log('////////////////////////////////')

        const { id, groupId, venueId, name, type, startDate, endDate } = event.dataValues;

        // console.log('////////////////////////////////')
        // console.log(`***** event.dataValues:`)
        // console.log(name)
        // console.log('////////////////////////////////')

        // create totalAttending
        let totalAttending;
        const attendances = allAttendances.filter(attendance => {
            return attendance.eventId === event.dataValues.id;
        });
        totalAttending = attendances.length;

        // create previewImageVal
        let previewImageVal;
        const eventImages = allEventImages.filter(eventImage => {
            return ((eventImage.dataValues.eventId === event.dataValues.id)
                && (eventImage.dataValues.preview === true));
        });
        if (eventImages.length === 0) previewImageVal = null;
        if (eventImages.length > 0) previewImageVal = eventImages[0].url;


        // console.log('////////////////////////////////')
        // console.log(`***** allEventImages:`)
        // console.log(allEventImages)
        // console.log('////////////////////////////////')


        // console.log('////////////////////////////////')
        // console.log(`***** event.dataValues.id:`)
        // console.log(event.dataValues.id)
        // console.log('////////////////////////////////')

        // create groupObj
        const groupObj = {
            id: group.id,
            name: group.name,
            city: group.city,
            state: group.state
        };

        // create venueVal
        let venueVal;
        const eventVenue = allVenues.filter(venue => {
            return venue.id === event.dataValues.venueId;
        });
        if (eventVenue.length === 0) venueVal = null;
        if (eventVenue.length > 0) venueVal = {
            id: eventVenue[0].id,
            city: eventVenue[0].city,
            state: eventVenue[0].state
        };

        // console.log('////////////////////////////////')
        // console.log(`***** eventVenue:`)
        // console.log(eventVenue)
        // console.log('////////////////////////////////')

        const eventObj = {
            id,
            groupId,
            venueId,
            name,
            type,
            startDate,
            endDate,
            numAttending: totalAttending,
            previewImage: previewImageVal,
            Group: groupObj,
            Venue: venueVal
        };

        groupEventsObj.Events.push(eventObj);
    });

    res.status(200);
    return res.json(groupEventsObj);
});




const validateVenue = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Street address is required`),
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`City is required`),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`State is required`),
    check('lat')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Latitude is not valid (cannot be empty)`),
    check('lat')
        .exists({ checkFalsy: true })
        .isDecimal() // try to figure out how to use .isLatLong()
        .withMessage(`Latitude is not valid`),
    check('lng')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Longitude is not valid (cannot be empty)`),
    check('lng')
        .exists({ checkFalsy: true })
        .isDecimal() // try to figure out how to use .isLatLong()
        .withMessage(`Longitude is not valid`),
    handleValidationErrors
]; // if any one is wrong, err is ret as res




/// FEEDBACK
// Creating & updating venues -
// It seems like we get the correct responses,
// but the new venue does not show in either:
// GET group details by id/ groups by current user endpoints, or in GET all venues by group id.
// It does seem like we do indeed create data,
// so the issue might be on our queries.
// Start by looking at dev.db: see if venue data has proper id’s saved in appropriate cols.

// Create a new Venue for a Group specified by its id (POST /api/groups/:groupId/venues) -- DRAFT V1
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res) => {
    const { user } = req;
    if (!user) { // should not run, since requireAuth should catch issues first (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;
    const { address, city, state, lat, lng } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) {
        res.status(404); // 404 Error: Couldn't find Group with specified id
        return res.json({ message: `Group couldn't be found` });
    };

    // Must be group organizer or co-host to create venue
    const hostOrCoHost = await Membership.findAll({
        where: {
            userId: currUserId,
            groupId: groupId,
            status: { [Op.in]: ['host', 'co-host'] }
        }
    });

    if (hostOrCoHost.length === 0) {
        res.status(403); // 403 Not Authorized: User must be group organizer or co-host to create an event
        return res.json({ message: `Forbidden: User must be group organizer or co-host to create an event` });
    };

    // // find all memberships where: { groupId: groupId, userId: currUserId, status: 'co-host' }
    // // find all group memberships where userId: currUserId
    // const userIsCoHost = await Membership.findAll(
    //     {
    //         where: { groupId: groupId, userId: currUserId, status: 'co-host' }
    //     }
    // ); // maybe come back and make more elegant by doing Op.in for status 'host' or 'co-host'

    // console.log('////////////////////////////////')
    // console.log(`***** userIsCoHost:`)
    // console.log(userIsCoHost)
    // console.log('////////////////////////////////')

    // // COME BACK TO THIS
    // if (!(currUserId === group.organizerId) && !userIsCoHost) { // if either is false
    //     res.status(403);
    //     return res.json({ message: `User must be a group organizer or co-host to add a venue.` });
    // };

    // if ((currUserId === group.organizerId) || userIsCoHost) { // if either is true
    //     await Venue.bulkCreate([{ groupId, address, city, state, lat, lng }],
    //         { validate: true });
    // };

    await Venue.bulkCreate([{ groupId, address, city, state, lat, lng }],
        { validate: true });

    const createdVenue = await Venue.findOne({ // to get createdVenue.id
        where: { groupId, address, city, state, lat, lng }
    });

    const createdVenueObj = {
        id: createdVenue.id,
        groupId: createdVenue.groupId,
        address: createdVenue.address,
        city: createdVenue.city,
        state: createdVenue.state,
        lat: createdVenue.lat,
        lng: createdVenue.lng
    };
    // createdVenueObj.id = createdVenue.id;
    // createdVenueObj.groupId = createdVenue.groupId;
    // createdVenueObj.address = createdVenue.address;
    // createdVenueObj.city = createdVenue.city;
    // createdVenueObj.state = createdVenue.state;
    // createdVenueObj.lat = createdVenue.lat;
    // createdVenueObj.lng = createdVenue.lng;

    res.status(200);
    return res.json(createdVenueObj);
});




/// FEEDBACK
// Creating & updating venues -
// It seems like we get the correct responses,
// but the new venue does not show in either:
// GET group details by id/ groups by current user endpoints, or in GET all venues by group id.
// It does seem like we do indeed create data,
// so the issue might be on our queries.
// Start by looking at dev.db: see if venue data has proper id’s saved in appropriate cols.
// -- Get All Venues WAS NOT GETTING ALL VENUES AFTER CREATING ONE
// -- NOW SEEMS FIXED

// Get All Venues for a Group specified by its id (GET /api/groups/:groupId/venues) -- V1
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) { // should not run, since requireAuth should catch issues first (but here as backup)
        res.status(401); // Unauthorized/Unauthenticated
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId); // removed after using 2nd approach: , { include: [{ model: Venue }] }
    if (!group) {
        res.status(404); // 404 Error: Couldn't find Group with specified id
        return res.json({ message: `Group couldn't be found` });
    };

    // console.log('////////////////////////////////')
    // console.log(`***** group:`)
    // console.log(group)
    // console.log('////////////////////////////////')

    // 1st approach: was ONLY getting venue(s) already existing in seed data
    // const groupVenuesArrOrig = group.dataValues.Venues;

    // 2nd approach: gets ALL of group's venues, including those added after seed data
    const groupVenuesArrOrig = await Venue.findAll({ where: { groupId: groupId } });

    console.log('////////////////////////////////')
    console.log(`***** groupVenuesArrOrig:`)
    console.log(groupVenuesArrOrig)
    console.log('////////////////////////////////')

    let allGroupVenuesObj = { Venues: [] };
    groupVenuesArrOrig.forEach(venue => {

        // console.log('////////////////////////////////')
        // console.log(`***** groupVenue:`)
        // console.log(groupVenue)
        // console.log('////////////////////////////////')

        // console.log('////////////////////////////////')
        // console.log(`***** groupVenue.dataValues.address:`)
        // console.log(groupVenue.dataValues.address)
        // console.log('////////////////////////////////')

        const { id, groupId, address, city, state, lat, lng } = venue.dataValues;

        const venueObj = { id, groupId, address, city, state, lat, lng };

        // const groupVenueObj2 = { // also works, just longer
        //     id: venue.dataValues.id,
        //     groupId: venue.dataValues.groupId,
        //     address: venue.dataValues.address,
        //     city: venue.dataValues.city,
        //     state: venue.dataValues.state,
        //     lat: venue.dataValues.lat,
        //     lng: venue.dataValues.lng,
        // };

        allGroupVenuesObj.Venues.push(venueObj);
    });

    res.status(200);
    return res.json(allGroupVenuesObj);
});




// Delete membership to a group specified by id (DELETE /api/groups/:groupId/membership)
router.delete('/:groupId/membership', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const groupId = req.params.groupId;
    const group = await Event.findByPk(groupId); // , { include: [{ model: Group }] }
    if (!group) { // 404 Error: Couldn't find a Group with the specified id
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    const currUserId = user.dataValues.id; // -- from session
    const memberId = req.body.memberId; // -- from body

    const membership = await Membership.findByPk(memberId); // membership to delete
    // const membership = await Membership.findOne( // membership to delete
    //     { where: { groupId: groupId, userId: userId } }
    // );
    if (!membership) { // 404 Error: Membership does not exist for this User
        res.status(404);
        return res.json({ message: `Membership does not exist for this User` });
    };

    const userId = membership.userId;
    const userOfInterest = await User.findByPk(userId);
    if (!userOfInterest) { // 400 Error: Couldn't find User with specified memberId
        res.status(400);
        return res.json({ message: `Couldn't find User with specified memberId` });
    };

    // create isHost
    let isHost = false;
    const currUserHostMembership = await Membership.findOne({
        where: {
            userId: currUserId,
            groupId: groupId,
            status: 'host'
        }
    });
    if (currUserHostMembership) isHost = true;

    // create isDeletingSelf
    let isDeletingSelf = false;
    if (currUserId === membership.userId) isDeletingSelf = true;

    if (!isHost && !isDeletingSelf) { // Error: Only User or organizer may delete an Membership
        res.status(403); // To delete membership, currUser must be group host, or deleting self
        return res.json({ message: `Forbidden: Only the User or organizer may delete a Membership` });
    };

    await membership.destroy();

    res.status(200);
    return res.json({ message: `Successfully deleted membership from group` });
});




// Request a Membership for a Group based on the Group's id (POST /api/groups/:groupId/membership)
router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;

    const group = await Group.findByPk(groupId);
    if (!group) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    const existingMembership = await Membership.findOne({
        where: { userId: currUserId, groupId: groupId }
    });

    // console.log('////////////////////////////////')
    // console.log(`***** existingMembership:`)
    // console.log(existingMembership.status)
    // console.log('////////////////////////////////')

    if (!existingMembership) {
        await Membership.bulkCreate([{
            userId: currUserId,
            groupId: groupId,
            status: 'pending'
        }], { validate: true });

        const createdMember = await Membership.findOne({
            where: {
                userId: currUserId,
                groupId: groupId,
                status: 'pending'
            }
        });

        const newMembershipObj = {
            groupId: createdMember.groupId,
            memberId: createdMember.id,
            status: createdMember.status
        };

        res.status(200);
        return res.json(newMembershipObj);
    };

    if (existingMembership.status === 'pending') {
        res.status(400);
        return res.json({ message: `Membership has already been requested (pending)` });
    };

    if (existingMembership.status === 'host' ||
        existingMembership.status === 'co-host' ||
        existingMembership.status === 'member') {
        res.status(400);
        return res.json({ message: `User is already a member of the group` });
    };
});



// maybe add validator here?
// Add an Image to a Group based on the Group's id (POST /api/groups/:groupId/images)
router.post('/:groupId/images', requireAuth, async (req, res) => {
    const { user } = req; // pull user from req
    // 'if (!user)' should not run, since 'requireAuth' will catch any reqs lacking authentication
    // but if 'requireAuth' didn't work, this would be a failsafe/backup
    if (!user) {
        res.status(401); // Unauthorized/Unauthenticated
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const { url, preview } = req.body;
    const groupId = req.params.groupId;

    const groupToAddImage = await Group.findByPk(groupId);
    if (!groupToAddImage) {
        res.status(404); // Not Found
        return res.json({ message: `Group couldn't be found` });
    };

    // If logged in, but trying to add image to group organized by another user....
    if (!(currUserId === groupToAddImage.organizerId)) {
        res.status(403); // Forbidden -- or is this 401 Unauthorized/Unauthenticated ?????
        return res.json({ message: `Forbidden: User must be the group organizer to add an image.` });
    };

    await GroupImage.bulkCreate([{ groupId, url, preview },],
        { validate: true });

    const createdGroupImage = await GroupImage.findOne({
        where: { groupId, url, preview }
    });

    const addedImageObj = {
        id: createdGroupImage.id,
        url: createdGroupImage.url,
        preview: createdGroupImage.preview
    };
    res.status(200);
    return res.json(addedImageObj);
});




// Delete a Group (DELETE /api/groups/:groupId) -- V1
router.delete('/:groupId', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;

    const groupToDelete = await Group.findByPk(groupId);
    if (!groupToDelete) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    if (!(currUserId === groupToDelete.organizerId)) {
        res.status(403);
        return res.json({ message: `Forbidden: Group must belong to the current user. User must be the group's organizer to delete it.` });
    };

    await groupToDelete.destroy();

    res.status(200);
    return res.json({ message: `Successfully deleted` });
});




const validateGroup = [
    check('name')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Name is required`),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .withMessage(`Name must be 60 characters or less`),
    check('about')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`About is required`),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .withMessage(`About must be 50 characters or more`),
    check('type')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Type is required`),
    check('type')
        .exists({ checkFalsy: true })
        // .notEmpty() // find correct thing for here
        // .not() // not + isIn might work here?
        .isIn(['Online', 'In person']) // not + isIn might work here?
        .withMessage(`Type must be 'Online' or 'In person'`),
    check('private')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Privacy setting is required`),
    check('private')
        .exists({ checkFalsy: true })
        // .notEmpty() // find correct thing for here
        // .not() // not + isIn might work here?
        // .isIn([true, false]) // not + isIn might work here?
        .isBoolean()
        .withMessage(`Private must be a boolean ('true' or 'false')`),
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`City is required`),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`State is required`),
    handleValidationErrors
]; // if any one is empty or incorrect, err is ret as res








// Change the status of a membership for a group specified by id (PUT /api/events/:groupId/membership)
router.put('/:groupId/membership', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const groupId = req.params.groupId;

    // 404 Error: Couldn't find a Group with the specified id
    const group = await Group.findByPk(groupId);
    if (!group) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    const { memberId, status } = req.body;
    const currUserId = user.dataValues.id;

    const membership = await Membership.findOne({ // membership to edit
        where: { groupId: groupId, userId: memberId }
    });

    const currentUserMembership = await Membership.findOne({ // membership that will perform the edit
        where: { groupId: groupId, userId: currUserId }
    });

    // 404 Error: If membership does not exist
    if (!membership) {
        res.status(404);
        return res.json({ message: `Membership between the user and the group does not exist` });
    };

    const userId = membership.userId;
    const userOfInterest = await User.findByPk(userId);

    // 400 Error: Couldn't find a User with the specified memberId
    if (!userOfInterest) {
        res.status(400);
        return res.json({
            message: `Validation Error`,
            errors: {
                status: `User couldn't be found`
            }
        });
    }

    // 400 Error: Cannot change status to "pending"
    if (status === 'pending') {
        res.status(400);
        return res.json({
            message: `Validation Error`,
            errors: {
                status: `Cannot change a membership status to pending`
            }
        });
    };

    // Current User must be host or co-host of group that group belongs to
    let host = false;
    if (currentUserMembership.status === 'host') host = true;
    let coHost = false;
    if (currentUserMembership.status === 'co-host') coHost = true;

    // console.log('////////////////////////////////')
    // console.log(`***** membership.status:`)
    // console.log(membership.status)
    // console.log('////////////////////////////////')
    // return res.json({ message: `test` });

    if (membership.status === 'pending' && status === 'member' && !host && !coHost) {

        res.status(403);
        return res.json({ message: `Forbidden: Membership can only be updated by a group host or co-host` });

    } else if (membership.status === 'member' && status === 'co-host' && !host) {

        res.status(403);
        return res.json({ message: `Forbidden: Co-host membership can only be updated by a group host` });

    } else if (membership.status === 'pending' && status === 'member' && (host || coHost)) {

        membership.userId = memberId;
        membership.status = status;
        await membership.save();

        const updatedMembership = await Membership.findOne({
            where: { userId: memberId, status: status }
        });

        const membershipObj = {
            id: updatedMembership.id,
            groupId,
            memberId,
            status
        };
        res.status(200);
        return res.json(membershipObj);

    } else if (status !== 'pending' && (host)) {

        membership.userId = memberId;
        membership.status = status;
        await membership.save();

        const updatedMembership = await Membership.findOne({
            where: { userId: memberId, status: status }
        });

        const membershipObj = {
            id: updatedMembership.id,
            groupId,
            memberId: updatedMembership.userId,
            status
        };
        res.status(200);
        return res.json(membershipObj);

    }

    // else {
    //     // return res.json({ message: `test` });
    // }

    // console.log('////////////////////////////////')
    // console.log(`***** hostOrCoHost:`)
    // console.log(hostOrCoHost)
    // console.log('////////////////////////////////')
});









// Edit a Group (PUT /api/groups/:groupId) -- V1
// ***** Require proper authorization: Group must belong to current user
router.put('/:groupId', requireAuth, validateGroup, async (req, res) => {
    const { user } = req; // pull user from req
    // 'if (!user)' should not run, since 'requireAuth' will catch any reqs lacking authentication
    // but if 'requireAuth' didn't work, this would be a failsafe/backup
    if (!user) {
        res.status(401); // Unauthorized/Unauthenticated
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId; // params, not query
    const { name, about, type, private, city, state } = req.body;

    const groupToUpdate = await Group.findByPk(groupId);
    if (!groupToUpdate) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // If logged in, but trying to edit group organized by another user....
    if (!(currUserId === groupToUpdate.organizerId)) {
        res.status(403); // Forbidden -- or is this 401 Unauthorized/Unauthenticated ?????
        return res.json({ message: `Forbidden: Group must belong to the current user. User must be the group's organizer to update it.` });
    };

    // DO UPDATES HERE
    groupToUpdate.name = name;
    groupToUpdate.about = about;
    groupToUpdate.type = type;
    groupToUpdate.private = private;
    groupToUpdate.city = city;
    groupToUpdate.state = state;
    await groupToUpdate.save();

    const updatedGroup = await Group.findByPk(groupId); // query again, for new 'updatedAt'

    res.status(200);
    return res.json(updatedGroup);
});




// Create a Group (POST /api/groups) -- V1
router.post('/', requireAuth, validateGroup, async (req, res) => {
    const { user } = req; // pull user from req
    // 'if (!user)' should not run, since 'requireAuth' will catch any reqs lacking authentication
    // but if 'requireAuth' didn't work, this would be a failsafe/backup
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const userId = user.dataValues.id;
    const { name, about, type, private, city, state } = req.body;

    await Group.bulkCreate([
        {
            organizerId: userId,
            name,
            about,
            type,
            private,
            city,
            state
        },
    ], { validate: true });

    const createdGroup = await Group.findOne({ // must query for the group to get: id, createdAt, updatedAt
        where: { // include all as failsafe against any w/ duplicate attributes (v low statistical prob, but why not)
            organizerId: userId,
            name: name,
            about: about,
            type: type,
            private: private,
            city: city,
            state: state
        }
    });

    const createdGroupId = createdGroup.id;
    await Membership.bulkCreate([
        {
            userId: userId,
            groupId: createdGroupId,
            status: 'host'
        },
    ], { validate: true });

    res.status(201);
    return res.json(createdGroup);
});

// // Get all Groups joined or organized by the Current User (GET /api/groups/current) -- V3
// Return all groups created by current user, or where current user has a membership.
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req; // pull user from req

    // console.log('////////////////////////////////')
    // console.log(`***** user:`)
    // console.log(user)
    // console.log('////////////////////////////////')

    // 'if (!user)' should not run, since 'requireAuth' will catch any reqs lacking authentication
    // but if 'requireAuth' didn't work, this would be a failsafe/backup
    if (!user) {
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    let allGroupsObj = { Groups: [] };

    const currUserId = user.dataValues.id;

    // console.log('////////////////////////////////')
    // console.log(`***** currUserId:`)
    // console.log(currUserId)
    // console.log('////////////////////////////////')

    const groupsOrig = await Group.findAll({
        // where: { organizerId: currUserId }, // this was limiting to only groups meeting this condition
        include: [
            { model: Membership }, // removed: where: { userId: currUserId } (& do not need as "currUserId")
            { model: GroupImage }
        ]
    });

    let groups = [];
    groupsOrig.forEach(group => {
        groups.push(group.toJSON()); // convert to JSON
    });

    // console.log('////////////////////////////////')
    // console.log(`***** groupsOrig:`)
    // console.log(groupsOrig)
    // console.log('////////////////////////////////')


    // 1. get all Memberships
    // 2. get Memberships where: { userId: currUserId }
    // 3. get groupId for each Membership where: { userId: currUserId }
    // 4. for each group, get count of Memberships with that groupId (numMembers)

    groups.forEach(group => {

        // console.log('////////////////////////////////')
        // console.log(`***** group.Memberships:`)
        // console.log(group.Memberships)
        // console.log('////////////////////////////////')

        // 1. create + add numMembers
        membershipsArr = group.Memberships;
        group.numMembers = membershipsArr.length;
        delete group.Memberships;

        // 2. create + add previewImage
        group.GroupImages.forEach(image => {
            // console.log(image.preview)
            if (image.preview === true) {
                // console.log(image)
                group.previewImage = image.url;
            };
        });
        if (!group.previewImage) {
            group.previewImage = 'No preview image found';
        };
        delete group.GroupImages;

        let allUserIdsInGroupMemberships = [];
        membershipsArr.forEach(membership => {
            const id = membership.userId;
            allUserIdsInGroupMemberships.push(id);
        });

        // console.log('////////////////////////////////')
        // console.log(`***** allUserIdsInGroupMemberships:`)
        // console.log(allUserIdsInGroupMemberships)
        // console.log('////////////////////////////////')

        if (allUserIdsInGroupMemberships.includes(currUserId)) {
            // 3. add group to allGroupsObj
            allGroupsObj.Groups.push(group);
        };
    });

    return res.json(allGroupsObj); // format: { Groups: [] }
});





/// FEEDBACK
// Creating & updating venues -
// It seems like we get the correct responses,
// but the new venue does not show in either:
// GET group details by id/ groups by current user endpoints, or in GET all venues by group id.
// It does seem like we do indeed create data,
// so the issue might be on our queries.
// Start by looking at dev.db: see if venue data has proper id’s saved in appropriate cols.
// -- Get details of a Group WAS NOT GETTING ALL VENUES AFTER CREATING ONE
// -- NOW SEEMS FIXED

// Get details of a Group from an id (GET /api/groups/:groupId) -- V1
router.get('/:groupId', async (req, res) => {
    const groupId = req.params.groupId;
    const groupOrig = await Group.findByPk(groupId, {
        include: [
            // { model: GroupImage },
            // { model: User }, // this one is causing problem
            // { model: Venue },
        ]
    });
    if (!groupOrig) {
        res.status(404); // 404 Error: Couldn't find a Group with the specified id
        return res.json({ message: `Group couldn't be found` });
    };

    group = groupOrig.toJSON(); // convert to JSON

    // create totalMembers:
    const memberships = await Membership.findAll(); // QUERY DB
    const membersArr = memberships.filter(membership => {
        return membership.groupId === group.id;
    });
    const totalMembers = membersArr.length;

    // create groupImagesArr:
    const groupImagesArr = [];
    const groupImagesArrOrig = await GroupImage.findAll({ where: { groupId: groupId } }); // QUERY DB
    // const groupImagesArrOrig = group.GroupImages; // want to remove groupId from orig
    groupImagesArrOrig.forEach(image => {
        const imageObj = {
            id: image.id,
            url: image.url,
            preview: image.preview
        };

        groupImagesArr.push(imageObj);
    });

    // create organizerObj:
    const users = await User.findAll(); // QUERY DB
    const usersArr = users.filter(user => {
        return user.id === group.organizerId;
    });
    const user = usersArr[0];
    const organizerObj = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
    };

    // create venuesArr:
    const venuesArr = [];
    const venuesArrOrig = await Venue.findAll({ where: { groupId: groupId } }); // QUERY DB
    // const venuesArrOrig = group.Venues;
    venuesArrOrig.forEach(venue => {
        const venueObj = {};
        venueObj.id = venue.id;
        venueObj.groupId = venue.groupId;
        venueObj.address = venue.address;
        venueObj.city = venue.city;
        venueObj.state = venue.state;
        venueObj.lat = venue.lat;
        venueObj.lng = venue.lng;

        venuesArr.push(venueObj);
    });

    const groupObj = { // manually creating obj helps ensure ideal order
        id: group.id,
        organizerId: group.organizerId,
        name: group.name,
        about: group.about,
        type: group.type,
        private: group.private,
        city: group.city,
        state: group.state,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        numMembers: totalMembers, // add
        GroupImages: groupImagesArr, // add
        Organizer: organizerObj, // add
        Venues: venuesArr // add
    };

    res.status(200);
    return res.json(groupObj);
});





// Get all Groups (GET /api/groups) -- V2
router.get('/', async (req, res) => {
    let allGroupsObj = { Groups: [] };

    const groupsOrig = await Group.findAll({
        include: [
            { model: Membership },
            { model: GroupImage }
        ]
    });

    // convert to JSON (not sure needed; keep to be safe)
    let groupsList = [];
    groupsOrig.forEach(group => {
        groupsList.push(group.toJSON());
    });

    groupsList.forEach(group => {

        // 1. create + add numMembers
        const membershipsArr = group.Memberships;
        group.numMembers = membershipsArr.length;
        delete group.Memberships;

        // 2. create + add previewImage
        group.GroupImages.forEach(image => {
            // console.log(image.preview)
            if (image.preview === true) {
                // console.log(image)
                group.previewImage = image.url;
            };
        });
        if (!group.previewImage) {
            group.previewImage = 'No preview image found';
        };
        delete group.GroupImages;

        // 3. add group to allGroupsObj
        allGroupsObj.Groups.push(group);
    });

    return res.json(allGroupsObj); // format: { Groups: [] }
});









module.exports = router;









////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////
////////////////// ALTERNATIVE VERSIONS //////////////////



// Get details of a Group from an id (GET /api/groups/:groupId) -- V1
// router.get('/:groupId', async (req, res) => {

//     const groupOrig = await Group.findByPk(req.params.groupId,
//         {
//             include: [
//                 { model: GroupImage },
//                 // { model: User }, // this one is causing problem
//                 { model: Venue },
//             ]
//         }
//     );

//     // Error response: Couldn't find a Group with the specified id
//     if (!groupOrig) {
//         res.status(404);
//         return res.json({ message: `Group couldn't be found` });
//     }

//     // convert to JSON
//     group = groupOrig.toJSON();

//     // create numMembers val (totalMembers):
//     let totalMembers;
//     const memberships = await Membership.findAll(); // QUERY DB
//     const membersArr = memberships.filter(membership => {
//         return membership.groupId === group.id;
//     });
//     totalMembers = membersArr.length;

//     // create GroupImages val (groupImagesArr):
//     let groupImagesArr = [];
//     const groupImagesArrOrig = group.GroupImages; // want to remove groupId from orig
//     groupImagesArrOrig.forEach(image => {
//         const imageObj = {};
//         imageObj.id = image.id;
//         imageObj.url = image.url;
//         imageObj.preview = image.preview;

//         groupImagesArr.push(imageObj);
//     });

//     // create Organizer val (organizerObj):
//     let organizerObj = {};
//     const users = await User.findAll(); // QUERY DB
//     const usersArr = users.filter(user => {
//         return user.id === group.organizerId;
//     });
//     const user = usersArr[0];
//     organizerObj.id = user.id;
//     organizerObj.firstName = user.firstName;
//     organizerObj.lastName = user.lastName;

//     // create Venues val (venuesArr):
//     let venuesArr = [];
//     const venuesArrOrig = group.Venues;
//     venuesArrOrig.forEach(venue => {
//         const venueObj = {};
//         venueObj.id = venue.id;
//         venueObj.groupId = venue.groupId;
//         venueObj.address = venue.address;
//         venueObj.city = venue.city;
//         venueObj.state = venue.state;
//         venueObj.lat = venue.lat;
//         venueObj.lng = venue.lng;

//         venuesArr.push(venueObj);
//     });

//     const groupObj = { // manually creating obj helps ensure ideal order
//         id: group.id,
//         organizerId: group.organizerId,
//         name: group.name,
//         about: group.about,
//         type: group.type,
//         private: group.private,
//         city: group.city,
//         state: group.state,
//         createdAt: group.createdAt,
//         updatedAt: group.updatedAt,
//         numMembers: totalMembers, // add
//         GroupImages: groupImagesArr, // add
//         Organizer: organizerObj, // add
//         Venues: venuesArr // add
//     };

//     // NOTES:
//     // ideally do more efficiently, w/o querying db for:
//     // await Membership
//     // await User

//     return res.json(groupObj);
// });



// Get all Groups (GET /api/groups) -- V2
// router.get('/', async (req, res) => {
//     let allGroupsObj = { Groups: [] };

//     const groupsOrig = await Group.findAll({
//         include: [
//             { model: Membership },
//             { model: GroupImage }
//         ]
//     });

//     // convert to JSON (not sure needed; keep to be safe)
//     let groupsList = [];
//     groupsOrig.forEach(group => {
//         groupsList.push(group.toJSON());
//     });

//     groupsList.forEach(group => {

//         // 1. create + add numMembers
//         membershipsArr = group.Memberships;
//         group.numMembers = membershipsArr.length;
//         delete group.Memberships;

//         // 2. create + add previewImage
//         group.GroupImages.forEach(image => {
//             // console.log(image.preview)
//             if (image.preview === true) {
//                 // console.log(image)
//                 group.previewImage = image.url;
//             };
//         });
//         if (!group.previewImage) {
//             group.previewImage = 'No preview image found';
//         };
//         delete group.GroupImages;

//         // 3. add group to allGroupsObj
//         allGroupsObj.Groups.push(group);
//     });

//     return res.json(allGroupsObj); // format: { Groups: [] }
// });



// Get all Groups (GET /api/groups) -- V1 -- ORIG BUT LONGER
// router.get('/', async (req, res) => {
//     let allGroupsObj = { Groups: [] };

//     const groupsOrig = await Group.findAll({ // ret arr of objs
//         include: [{ model: GroupImage }] // remove this outer arr?
//     });

//     const memberships = await Membership.findAll();

//     groupsOrig.forEach(group => {

//         // creating numMembers:

//         const membersArr = memberships.filter(membership => {
//             return membership.groupId === group.id; // fixed by adding 'return'
//         });

//         const groupObj = {
//             id: group.id,
//             organizerId: group.organizerId,
//             name: group.name,
//             about: group.about,
//             type: group.type,
//             private: group.private,
//             city: group.city,
//             state: group.state,
//             createdAt: group.createdAt,
//             updatedAt: group.updatedAt,
//             numMembers: membersArr.length // add numMembers prop
//         };

//         // creating previewImage:

//         group.GroupImages.forEach(image => {

//             if (image.preview === true) {
//                 groupObj.previewImage = image.url // add previewImage prop
//             } else {
//                 groupObj.previewImage = 'No preview image found'
//             }
//         });

//         allGroupsObj.Groups.push(groupObj);
//     });

//     return res.json(allGroupsObj);
// });


////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////
////////////////// OLD DRAFT CODE //////////////////





// // Delete membership to a group specified by id (DELETE /api/groups/:groupId/membership) -- V1
// router.delete('/:groupId/membership', requireAuth, async (req, res) => {
//     const { user } = req;
//     if (!user) {
//         res.status(401);
//         return res.json({ message: `Authentication Required. No user is currently logged in.` });
//     };

//     const currUserId = user.dataValues.id;
//     const memberIdToDelete = req.body.memberId;
//     const groupId = req.params.groupId;
//     const allMemberships = await Membership.findAll();

//     // Current User must be host of group, or user whose membership is being deleted

//     // create isHost
//     let isHost = false;
//     allMemberships.forEach(membership => {
//         if (
//             membership.userId === currUserId &&
//             membership.groupId === groupId &&
//             membership.status === 'host'
//         ) {
//             isHost = true;
//         }
//     });

//     // create isDeletingSelf
//     let isDeletingSelf = false;
//     allMemberships.forEach(membership => {
//         if (
//             membership.userId === currUserId &&
//             membership.groupId === groupId &&
//             membership.id === memberIdToDelete
//         ) {
//             isDeletingSelf = true;
//         }
//     });

//     // // find membership that matches currUserId + groupId
//     const membershipToDelete = await Membership.findByPk(memberIdToDelete,
//         // { include: [{ model: User }, { model: Group }] }
//     );

//     // DELETION HERE
//     if (isHost || isDeletingSelf) {

//         await membershipToDelete.destroy();

//         res.status(200);
//         return res.json({ message: `Successfully deleted membership from group` });
//     };

//     // Error: Couldn't find a User with the specified memberIdToDelete
//     if (!membershipToDelete) {
//         res.status(400);
//         const err = {
//             "message": "Validation Error",
//             "errors": {
//                 "memberId": "User couldn't be found"
//             }
//         };
//         return res.json(err);
//     };

//     // Error: Couldn't find a Group with the specified id
//     const group = await Membership.findByPk(groupId);
//     if (!group) {
//         res.status(404);
//         return res.json({ message: `Group couldn't be found` });
//     };

//     // Error: Membership does not exist for this User
//     if (!isHost && !isDeletingSelf) {
//         res.status(404);
//         return res.json({ message: `Membership does not exist for this User` });
//     };
// });






// // Get all Groups joined or organized by the Current User (GET /api/groups/current) -- DRAFT V3
// Return all groups created by current user, or where current user has a membership.
// require authentication: TRUE
// router.get('/current', requireAuth, async (req, res) => {
//     const { user } = req; // pull user from req

//     // console.log('////////////////////////////////')
//     // console.log(`***** user:`)
//     // console.log(user)
//     // console.log('////////////////////////////////')

//     // this 'if (!user)' will not run, since 'requireAuth' will catch any reqs lacking authentication
//     // but if 'requireAuth' didn't work, this would be a failsafe/backup
//     if (!user) {
//         res.status(401);
//         return res.json({ message: `Authentication Required. No user is currently logged in.` });
//     };

//     let allGroupsObj = { Groups: [] };

//     const currUserId = user.dataValues.id;

//     // console.log('////////////////////////////////')
//     // console.log(`***** currUserId:`)
//     // console.log(currUserId)
//     // console.log('////////////////////////////////')

//     const groupsOrig = await Group.findAll({
//         // where: { organizerId: currUserId }, // this was limiting to only groups meeting this condition
//         include: [
//             { model: Membership }, // removed: where: { userId: currUserId } (& do not need as "currUserId")
//             { model: GroupImage }
//         ]
//     });

//     let groups = [];
//     groupsOrig.forEach(group => {
//         groups.push(group.toJSON()); // convert to JSON
//     });

//     // console.log('////////////////////////////////')
//     // console.log(`***** groupsOrig:`)
//     // console.log(groupsOrig)
//     // console.log('////////////////////////////////')


//     // 1. get all Memberships
//     // 2. get Memberships where: { userId: currUserId }
//     // 3. get groupId for each Membership where: { userId: currUserId }
//     // 4. for each group, get count of Memberships with that groupId (numMembers)

//     groups.forEach(group => {

//         // console.log('////////////////////////////////')
//         // console.log(`***** group.Memberships:`)
//         // console.log(group.Memberships)
//         // console.log('////////////////////////////////')

//         // 1. create + add numMembers
//         membershipsArr = group.Memberships;
//         group.numMembers = membershipsArr.length;
//         delete group.Memberships;

//         // 2. create + add previewImage
//         group.GroupImages.forEach(image => {
//             // console.log(image.preview)
//             if (image.preview === true) {
//                 // console.log(image)
//                 group.previewImage = image.url;
//             };
//         });
//         if (!group.previewImage) {
//             group.previewImage = 'No preview image found';
//         };
//         delete group.GroupImages;

//         let allUserIdsInGroupMemberships = [];
//         membershipsArr.forEach(membership => {
//             const id = membership.userId;
//             allUserIdsInGroupMemberships.push(id);
//         });

//         // console.log('////////////////////////////////')
//         // console.log(`***** allUserIdsInGroupMemberships:`)
//         // console.log(allUserIdsInGroupMemberships)
//         // console.log('////////////////////////////////')

//         if (allUserIdsInGroupMemberships.includes(currUserId)) {
//             // 3. add group to allGroupsObj
//             allGroupsObj.Groups.push(group);
//         };
//     });

//     return res.json(allGroupsObj); // format: { Groups: [] }
// });



// // // Get all Groups joined or organized by the Current User (GET /api/groups/current) -- DRAFT V2
// // Return all groups created by current user, or where current user has a membership.
// // require authentication: TRUE
// router.get('/current', async (req, res) => {
//     const { user } = req; // pull user from req

//     // console.log('////////////////////////////////')
//     // console.log(`***** user:`)
//     // console.log(user)
//     // console.log('////////////////////////////////')

//     if (!user) {
//         res.status(404); // change to client-side error code
//         return res.json({ message: `No user is currently logged in` });
//     };

//     let allGroupsObj = { Groups: [] };

//     const currUserId = user.dataValues.id;

//     // console.log('////////////////////////////////')
//     // console.log(`***** currUserId:`)
//     // console.log(currUserId)
//     // console.log('////////////////////////////////')

//     const groupsOrig = await Group.findAll({
//         // where: { organizerId: currUserId }, // this was limiting to only groups meeting this condition
//         include: [
//             { model: Membership }, // removed: where: { userId: currUserId } (& do not need as "currUserId")
//             { model: GroupImage }
//         ]
//     });

//     let groups = [];
//     groupsOrig.forEach(group => {
//         groups.push(group.toJSON()); // convert to JSON
//     });

//     // console.log('////////////////////////////////')
//     // console.log(`***** groupsOrig:`)
//     // console.log(groupsOrig)
//     // console.log('////////////////////////////////')


//     // 1. get all Memberships
//     // 2. get Memberships where: { userId: currUserId }
//     // 3. get groupId for each Membership where: { userId: currUserId }
//     // 4. for each group, get count of Memberships with that groupId (numMembers)

//     groups.forEach(group => {

//         console.log('////////////////////////////////')
//         console.log(`***** group.Memberships:`)
//         console.log(group.Memberships)
//         console.log('////////////////////////////////')

//         // if (group.Membership.userId === currUserId) {

//         // 1. create + add numMembers
//         membershipsArr = group.Memberships;
//         group.numMembers = membershipsArr.length;
//         delete group.Memberships;

//         // 2. create + add previewImage
//         group.GroupImages.forEach(image => {
//             // console.log(image.preview)
//             if (image.preview === true) {
//                 // console.log(image)
//                 group.previewImage = image.url;
//             };
//         });
//         if (!group.previewImage) {
//             group.previewImage = 'No preview image found';
//         };
//         delete group.GroupImages;

//         // 3. add group to allGroupsObj
//         allGroupsObj.Groups.push(group);
//         // }
//     });

//     return res.json(allGroupsObj); // format: { Groups: [] }
// });


// // Get all Groups joined or organized by Current User (GET /api/groups/current) -- ORIG DRAFT

// Returns all the groups either created by the current user or those where the
// current user has a membership.

// router.get('/current', async (req, res) => {

//     const currUserGroups = await Group.findAll({
//         // include: [
//         //     { model: Membership }
//         // ],
//         where: {
//             [Op.or]: [
//                 { organizerId: req.user.id },
//                 // { groupId: req.user.id }
//             ]
//         }
//     });

//     return res.json(currUserGroups);
// });



// Get details of a Group from an id (GET /api/groups/:groupId) -- ORIG DRAFT
// router.get('/:groupId', async (req, res) => {

//     const group = await Group.findByPk(req.params.groupId,
//         {
//             include: [
//                 { model: GroupImage },
//                 // { model: Organizer }, // this one is causing problem
//                 { model: Venue },
//             ]
//         }
//     );

//     // creating numMembers:
//     const memberships = await Membership.findAll();

//     const membersArr = memberships.filter(membership => {
//         return membership.groupId === group.id; // fixed by adding 'return'
//     });

//     const groupObj = {
//         id: group.id,
//         organizerId: group.organizerId,
//         name: group.name,
//         about: group.about,
//         type: group.type,
//         private: group.private,
//         city: group.city,
//         state: group.state,
//         createdAt: group.createdAt,
//         updatedAt: group.updatedAt,
//         numMembers: membersArr.length, // add
//         GroupImages: group.GroupImages, // add
//         // Organizer: group.Organizer, // add
//         Venues: group.Venues // add
//     };

//     return res.json(groupObj);
// });


// WORKING
// // GET ALL GROUPS (GET / api / groups)
// router.get('/', async (req, res) => {
//     let allGroupsObj = { Groups: [] };

//     const groupsOrig = await Group.findAll({ // ret arr of objs
//         include: [{ model: GroupImage }] // remove this outer arr?
//     });

//     const memberships = await Membership.findAll();

//     groupsOrig.forEach(group => {

//         // add numMembers:

//         const membersArr = memberships.filter(membership => {
//             return membership.groupId === group.id; // fixed by adding 'return'
//         });

//         const groupObj = {
//             id: group.id,
//             organizerId: group.organizerId,
//             name: group.name,
//             about: group.about,
//             type: group.type,
//             private: group.private,
//             city: group.city,
//             state: group.state,
//             createdAt: group.createdAt,
//             updatedAt: group.updatedAt,
//             numMembers: membersArr.length // add numMembers
//         };

//         // add previewImage:

//         group.GroupImages.forEach(image => {
//             if (image.preview === true) {
//                 groupObj.previewImage = image.url // add previewImage prop
//             }
//         });

//         if (!groupObj.previewImage) {
//             groupObj.previewImage = 'No preview image found'
//         };

//         allGroupsObj.Groups.push(groupObj);
//     });

//     return res.json(allGroupsObj);
// });

// WORKING
// router.get('/', async (req, res) => {
//     const groups = await Group.findAll({
//         include: [
//             // { model: Membership },
//             { model: GroupImage }
//         ]
//     })

    // let groups = []; // convert to JSON, but p sure we don't need it
    // groupsOrig.forEach(group => {
    //     groups.push(group.toJSON())
    // });

//     groupsList.forEach(group => {
//         group.GroupImages.forEach(image => {
//             // console.log(image.preview)
//             if (image.preview === true) {
//                 // console.log(image)
//                 group.previewImage = image.url
//             }
//         })
//         if (!group.previewImage) {
//             group.previewImage = 'No preview image found'
//         }
//         delete group.GroupImages
//     });

//     res.json(groupsList);
// });



// router.get('/', async (req, res) => {
//     const games = await Boardgame.findAll({
//         include: [
//             { model: Review },
//             { model: Image }
//         ]
//     })

//     let gamesList = [];
//     games.forEach(game => {
//         gamesList.push(game.toJSON())
//     });

//     gamesList.forEach(game => {
//         game.Images.forEach(image => {
//             // console.log(image.bannerImage)
//             if (image.bannerImage === true) {
//                 // console.log(image)
//                 game.bannerImage = image.url
//             }
//         })
//         if (!game.bannerImage) {
//             game.bannerImage = 'No banner image found'
//         }
//         delete game.Images
//     });

//     res.json(gamesList);
// });


// router.get('/', async (req, res) => {
//     const groupsOrig = await Group.findAll({
//         include: [
//             // { model: Membership },
//             { model: GroupImage }
//         ]
//     })

//     let groups = [];
//     groupsOrig.forEach(group => {
//         groups.push(group.toJSON())
//     });

//     groups.forEach(group => {

//         group.GroupImages.forEach(image => {
//             // console.log(image.preview)
//             if (image.preview === true) {
//                 // console.log(image)
//                 group.previewImage = image.url
//             }
//         })
//         if (!group.previewImage) {
//             group.previewImage = 'No preview image found'
//         }
//         delete group.GroupImages
//     });

//     res.json(groups);
// });





// // GET ALL GROUPS(GET / api / groups)-- WITH "numMembers" & "previewImage"
// router.get('/', async (req, res) => {
//     let allGroupsObj = { Groups: [] };

//     const allGroups = await Group.findAll({ // ret arr of objs
//         include: [
//             // { model: Membership },
//             { model: GroupImage }
//         ]
//         // where: {
//         //     preview: true
//         // },
//         // limit: 1
//     });

//     const allMemberships = await Membership.findAll();
//     const allGroupImages = await GroupImage.findAll();

//     // include model GroupImage when finding allGroups
//     // specify where preview is true; attributes just url
//     // limit 1, to just get first one that meets conditions
//     // for each group, find url for GroupImage with that groupId, where preview: true

//     allGroups.forEach(group => {
//         const membersArr = allMemberships.filter(membership => {
//             return membership.groupId === group.id; // fixed by adding 'return'
//         });

//         // const imgsArr = allGroupImages.filter(image => {
//         //     return (image.groupId === group.id && image.preview === true);
//         // });

//         // const imgs = [];
//         // imgsArr.forEach(img => {
//         //     imgs.push(img)
//         // })

//         // const img = imgs[0];
//         // console.log(`img: `, img)

//         // const previewImgUrl = ''; // not done
//         const groupObj = {
//             id: group.id,
//             organizerId: group.organizerId,
//             name: group.name,
//             about: group.about,
//             type: group.type,
//             private: group.private,
//             city: group.city,
//             state: group.state,
//             createdAt: group.createdAt,
//             updatedAt: group.updatedAt,
//             numMembers: membersArr.length,
//             // previewImage: imgsArr[0] // not done
//         };
//         allGroupsObj.Groups.push(groupObj);
//     });
//     return res.json(allGroupsObj);
// });































// // GET ALL GROUPS (GET /api/groups) -- WITH "numMembers" & "previewImage"
// router.get('/', async (req, res) => {

//     let allGroupsObj = { Groups: [] };
//     const allGroupsArr = await Group.findAll(

//     );
//     const allMembershipsArr = await Membership.findAll();

//     // include model GroupImage when finding allGroupsArr
//     // specify where preview is true; attributes just url
//     // limit 1, to just get first one that meets conditions


//     // for each group, find url for GroupImage with that groupId, where preview: true
//     allGroupsArr.forEach(group => { // removed 'async' from before 'group'

//         const memsArr = allMembershipsArr.filter(membership => {
//             return membership.groupId === group.id;
//             // console.log(membership.groupId === group.id);
//             // console.log(membership.groupId);
//             // console.log(group.id);
//         });

//         // console.log('');
//         // console.log(memsArr);
//         // console.log('');

//         // const membersCount = Membership.count({ // ret arr of objs
//         //     where: {
//         //         groupId: group.id
//         //     }
//         // });

//         // const membersArr = await Membership.findAll({ // ret arr of objs
//         //     where: {
//         //         groupId: group.id
//         //     }
//         // });

//         // groupObj.numMembers = membersArr.length;
//         // groupObj.numMembers = groupId;

//         // const numMembs = NUMHERE; // not done
//         const previewImgUrl = ''; // not done

//         const groupObj = {
//             id: group.id,
//             organizerId: group.organizerId,
//             name: group.name,
//             about: group.about,
//             type: group.type,
//             private: group.private,
//             city: group.city,
//             state: group.state,
//             createdAt: group.createdAt,
//             updatedAt: group.updatedAt,
//             numMembers: memsArr.length, // not done
//             previewImage: previewImgUrl, // not done
//         }

//         allGroupsObj.Groups.push(groupObj); // add each group as an obj
//     });

//     return res.json(allGroupsObj);

// });



// // GET ALL GROUPS (GET /api/groups) -- WITH "numMembers" & "previewImage"
// router.get('/', async (req, res) => {

//     let allGroupsObj = { Groups: [] };

//     const allGroupsArr = await Group.findAll({
//         include: [
//             { model: Membership },
//             { model: GroupImage }
//         ]
//     });

//     groupIds = [];
//     allGroupsArr.forEach(group => {
//         groupIds.push(group.id);
//     }); // groupIds = [1, 2, 3]

//     const allMembershipsArr = await Membership.findAll();

//     // for each group, find url for GroupImage with that groupId, where preview: true

//     allGroupsArr.forEach(group => {

//         const memsArr = allMembershipsArr.filter(membership => {
//             membership.groupId === group.id;
//         });

//         // for each group, find count of Memberships with that groupId
//         const membersCount = Membership.count({ // ret arr of objs
//             where: {
//                 groupId: group.id
//             }
//         });

//         // for each group, find count of Memberships with that groupId
//         const membersArr = Membership.findAll({ // ret arr of objs
//             where: {
//                 groupId: group.id
//             }
//         });

//         // groupObj.numMembers = membersArr.length;
//         // groupObj.numMembers = groupId;

//         // const numMembs = 10; // not done
//         const previewImgUrl = ''; // not done

//         const groupObj = {
//             id: group.id,
//             organizerId: group.organizerId,
//             name: group.name,
//             about: group.about,
//             type: group.type,
//             private: group.private,
//             city: group.city,
//             state: group.state,
//             createdAt: group.createdAt,
//             updatedAt: group.updatedAt,
//             numMembers: memsArr.length, // not done
//             previewImage: previewImgUrl, // not done
//         }

//         allGroupsObj.Groups.push(groupObj); // add each group as an obj
//     });

//     return res.json(allGroupsObj);

// });

// GET ALL GROUPS (GET /api/groups) -- w/o "numMembers" & "previewImage"
// router.get('/', async (req, res) => {

//     const groups = await Group.findAll(); // ret arr of objs

//     return res.json(groups);

// });




//////

// Change the status of a membership for a group specified by id (PUT /api/events/:groupId/membership)
// router.put('/:groupId/membership', requireAuth, async (req, res) => {
//     const { user } = req;
//     if (!user) {
//         res.status(401);
//         return res.json({ message: `Authentication Required. No user is currently logged in.` });
//     };

//     const groupId = req.params.groupId;

//     // 404 Error: Couldn't find a Group with the specified id
//     const group = await Group.findByPk(groupId);
//     if (!group) {
//         res.status(404);
//         return res.json({ message: `Group couldn't be found` });
//     };

//     const { memberId, status } = req.body;
//     const currUserId = user.dataValues.id;

//     const membership = await Membership.findOne({ // membership to edit
//         where: { groupId: groupId, userId: memberId }
//     });

//     const currentUserMembership = await Membership.findOne({ // membership that will perform the edit
//         where: { groupId: groupId, userId: currUserId }
//     });

//     // 404 Error: If membership does not exist
//     if (!membership) {
//         res.status(404);
//         return res.json({ message: `Membership between the user and the group does not exist` });
//     };

//     const userId = membership.userId;
//     const userOfInterest = await User.findByPk(userId);

//     // 400 Error: Couldn't find a User with the specified memberId
//     if (!userOfInterest) {
//         res.status(400);
//         return res.json({
//             message: `Validation Error`,
//             errors: {
//                 status: `User couldn't be found`
//             }
//         });
//     }

//     // 400 Error: Cannot change status to "pending"
//     if (status === 'pending') {
//         res.status(400);
//         return res.json({
//             message: `Validation Error`,
//             errors: {
//                 status: `Cannot change a membership status to pending`
//             }
//         });
//     };

//     // Current User must be host or co-host of group that group belongs to
//     let host = false;
//     if (currentUserMembership.status === 'host') host = true;
//     let coHost = false;
//     if (currentUserMembership.status === 'co-host') coHost = true;

//     // console.log('////////////////////////////////')
//     // console.log(`***** membership.status:`)
//     // console.log(membership.status)
//     // console.log('////////////////////////////////')
//     // return res.json({ message: `test` });

//     if (membership.status === 'pending' && status === 'member' && !host && !coHost) {

//         res.status(403);
//         return res.json({ message: `Membership can only be updated by a group host or co-host` });

//     } else if (membership.status === 'member' && status === 'co-host' && !host) {

//         res.status(403);
//         return res.json({ message: `Co-host membership can only be updated by a group host` });

//     } else if (membership.status === 'member' && status === 'co-host' && (host)) {

//         membership.memberId = memberId;
//         membership.status = status;
//         await membership.save();

//         const updatedMembership = await Membership.findOne({
//             where: { memberId: memberId, status: status }
//         });

//         const membershipObj = {
//             id: updatedMembership.id,
//             groupId,
//             memberId,
//             status
//         };
//         res.status(200);
//         return res.json(membershipObj);

//     } else if (membership.status === 'pending' && status === 'member' && (host || coHost)) {

//         membership.memberId = memberId;
//         membership.status = status;
//         await membership.save();

//         const updatedMembership = await Membership.findOne({
//             where: { memberId: memberId, status: status }
//         });

//         const membershipObj = {
//             id: updatedMembership.id,
//             groupId,
//             memberId,
//             status
//         };
//         res.status(200);
//         return res.json(membershipObj);

//     } else {
//         // return res.json({ message: `test` });
//     }

//     // console.log('////////////////////////////////')
//     // console.log(`***** hostOrCoHost:`)
//     // console.log(hostOrCoHost)
//     // console.log('////////////////////////////////')
// });
