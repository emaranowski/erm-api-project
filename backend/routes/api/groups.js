// resources for route paths beginning in: /api/groups
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();


// event validator (if any single check is wrong, error is returned as response)
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
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage(`Name must be at least 5 characters`),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In person'])
        .withMessage(`Type must be 'In Person' or 'Online'`),
    check('capacity')
        .exists({ checkFalsy: true })
        .isInt()
        .withMessage(`A number for capacity is required`),
    check('price')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage(`A number for price is required (type "0" if it's free!)`),
    check('description')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Description is required`),
    check('description')
        .exists({ checkFalsy: true })
        .isLength({ min: 30 })
        .withMessage(`Description must be at least 30 characters`),
    check('startDate')
        .exists({ checkFalsy: true })
        .isAfter(Date.parse(Date.now()))
        .withMessage(`Start date must be in the future`),
    check('endDate')
        .exists({ checkFalsy: true })
        .isAfter(Date.parse(this.startDate))
        .withMessage(`End date must be after start date`),
    handleValidationErrors
];


// Create an Event for a Group specified by its id (POST /api/groups/:groupId/events)
// (to create event, current user must be group organizer/host or co-host)
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues first (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) { // 404 Not Found: Couldn't find Group with specified id
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // find membership with matching userId, groupId, and host/organizer or co-host
    const hostOrCoHost = await Membership.findAll({
        where: {
            userId: currUserId,
            groupId: groupId,
            status: { [Op.in]: ['host', 'co-host'] }
        }
    });

    // if current user is not group host/organizer or co-host
    if (hostOrCoHost.length === 0) {
        res.status(403); // return 403 + 'not authorized' message
        return res.json({ message: `Forbidden: User must be group organizer or co-host to create an event` });
    };

    // create reference event, to determine id for new event
    let refEvent = await Event.findOne({
        order: [['id', 'DESC']],
    });

    !refEvent ? refEvent = { dataValues: { id: 1 } } : refEvent;

    // const refEventId = refEvent.dataValues.id;
    // create refEventIdPlusOne
    const refEventIdPlusOne = refEvent.dataValues.id + 1;

    await Event.bulkCreate([{ // create event
        id: refEventIdPlusOne,
        venueId,
        groupId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    }], { validate: true });

    // get the just-created event, to get its id (createdGroupEvent.id)
    const createdGroupEvent = await Event.findByPk(refEventIdPlusOne);

    // TODO: consider assigning event host as an attendee by default
    // await Attendance.bulkCreate([{
    //     eventId: createdGroupEvent.id,
    //     userId: currUserId,
    //     status: 'attending'
    // }], { validate: true });

    // create & return eventObj
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
});


// Get all Members of a Group specified by its id (GET /api/groups/:groupId/members)
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

    // create hostOrCoHost
    const hostOrCoHost = [];
    allMemberships.forEach(membership => {
        if (membership.userId === currUserId &&
            (membership.status === 'host' || membership.status === 'co-host')
        ) {
            hostOrCoHost.push(membership.status)
        }
    });

    // If user is host/co-host, display all members:
    // host, co-host, member, pending
    if (hostOrCoHost.length === 1) {
        allMemberships.forEach(member => {

            const user = allUsers.filter(user => {
                return user.id === member.dataValues.userId;
            });

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

    // If user is NOT host/co-host, display non-pending members:
    // host, co-host, member
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


// Get all Events of a Group specified by its id (GET /api/groups/:groupId/events)
router.get('/:groupId/events', async (req, res) => {

    // create groupEventsObj (to collect all events for group)
    let groupEventsObj = { Events: [] };

    // get group (including Event model)
    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId,
        { include: [{ model: Event }] }
    );

    if (!group) { // if no group
        res.status(404); // return 404 + 'not found' message
        res.json({ message: `Group couldn't be found` })
    };

    ////// todo: explore later -- get all events with matching groupId:
    // const groupEventsArrOrig = await Event.findAll({
    //     where: { groupId: groupId }
    // });

    // get all attendances, event images, and venues
    const allAttendances = await Attendance.findAll();
    const allEventImages = await EventImage.findAll();
    const allVenues = await Venue.findAll();

    // for each group event
    group.Events.forEach(event => {
        // get event info
        const { id, groupId, venueId, name, type, startDate, endDate } = event.dataValues;

        // create totalAttending/numAttending
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

        // create eventObj
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

        // add eventObj to groupEventsObj.Events
        groupEventsObj.Events.push(eventObj);
    });

    // return 200 + groupEventsObj fully populated with all events for group
    res.status(200);
    return res.json(groupEventsObj);
});


// venue validator (if any single check is wrong, error is returned as response)
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
        .isFloat() // todo: explore how to use .isLatLong()
        .withMessage(`Latitude is not valid`),
    check('lng')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Longitude is not valid (cannot be empty)`),
    check('lng')
        .exists({ checkFalsy: true })
        .isFloat() // todo: explore how to use .isLatLong()
        .withMessage(`Longitude is not valid`),
    handleValidationErrors
];


// Create a new Venue for a Group specified by its id (POST /api/groups/:groupId/venues)
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // get currUserId + groupId to identify if hostOrCoHost
    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;

    // get venue info from request, to later create venue
    const { address, city, state, lat, lng } = req.body;

    // get group
    const group = await Group.findByPk(groupId);
    if (!group) { // if no group
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Group couldn't be found` });
    };

    // must be group host/organizer or co-host to create venue for group
    const hostOrCoHost = await Membership.findAll({
        where: {
            userId: currUserId,
            groupId: groupId,
            status: { [Op.in]: ['host', 'co-host'] }
        }
    });

    // if user is not group host/organizer or co-host
    if (hostOrCoHost.length === 0) {
        res.status(403); // return 403 + 'not authorized' message
        return res.json({ message: `Forbidden: User must be group organizer or co-host to create a venue` });
    };

    // create venue
    await Venue.bulkCreate([{ groupId, address, city, state, lat, lng }],
        { validate: true });

    // get just-created venue, to get createdVenue.id
    const createdVenue = await Venue.findOne({
        where: { groupId, address, city, state, lat, lng }
    });

    // create createdVenueObj
    const createdVenueObj = {
        id: createdVenue.id,
        groupId: createdVenue.groupId,
        address: createdVenue.address,
        city: createdVenue.city,
        state: createdVenue.state,
        lat: createdVenue.lat,
        lng: createdVenue.lng
    };

    // return 200 + createdVenueObj
    res.status(200);
    return res.json(createdVenueObj);
});


////// Should be resolved, but double-check to be sure:
// Creating & updating venues - seems like we get the correct responses,
// but the new venue does not show in either:
// GET group details by id/ groups by current user endpoints, or in GET all venues by group id.
// It seems like we do create the venue, so issue might be in queries.
// Start by looking at dev.db: see if venue data has proper ids saved in appropriate cols.
// -- 'Get All Venues' was not getting all venues after creating one.
// -- Solution: changed approach from...
// 1) including Venue model in .findByPk() ...to...
// 2) .findAll() where groupId matches

// Get All Venues for a Group specified by its id (GET /api/groups/:groupId/venues)
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // get group
    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId); // removed Venue model after using 2nd approach: , { include: [{ model: Venue }] }
    if (!group) { // if no group
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Group couldn't be found` });
    };

    // 1st approach: gets ONLY venues already in seed data
    // const groupVenuesArrOrig = group.dataValues.Venues;
    // 2nd approach: gets ALL venues for group, including those added after seed data
    const groupVenuesArrOrig = await Venue.findAll({
        where: { groupId: groupId }
    });

    // create allGroupVenuesObj to collect venues for group
    let allGroupVenuesObj = { Venues: [] };
    // for each group venue
    groupVenuesArrOrig.forEach(venue => {
        // get venue info
        const { id, groupId, address, city, state, lat, lng } = venue.dataValues;
        // create venueObj
        const venueObj = { id, groupId, address, city, state, lat, lng };
        // add venueObj to allGroupVenuesObj
        allGroupVenuesObj.Venues.push(venueObj);
    });

    // return 200 + allGroupVenuesObj fully populated with all venues for group
    res.status(200);
    return res.json(allGroupVenuesObj);
});


// Delete membership to a group specified by id (DELETE /api/groups/:groupId/membership)
router.delete('/:groupId/membership', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // get group
    const groupId = req.params.groupId;
    const group = await Event.findByPk(groupId); // , { include: [{ model: Group }] }
    if (!group) { // if no group
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Group couldn't be found` });
    };

    // get currUserId + memberId
    const currUserId = user.dataValues.id; // from session
    const memberId = req.body.memberId; // from body

    // get membership to delete
    const membership = await Membership.findByPk(memberId);
    if (!membership) { // if no membership
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Membership does not exist for this User` });
    };

    // get userOfInterest
    const userId = membership.userId;
    const userOfInterest = await User.findByPk(userId);
    if (!userOfInterest) { // todo: make sure no downstream effects before fixing 400 to 404
        res.status(400); // return 404 + 'not found' message
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

    // to delete membership, user must be group host, or deleting own membership
    if (!isHost && !isDeletingSelf) { // if not group host, AND not deleting own membership
        res.status(403); // return 403 + 'forbidden' message
        return res.json({ message: `Forbidden: Only the User or organizer may delete a Membership` });
    };

    // if user is group host, OR deleting own membership
    await membership.destroy(); // delete membership
    res.status(200); // return 200 + 'success' message
    return res.json({ message: `Successfully deleted membership from group` });
});


// Request a Membership for a Group based on the Group's id (POST /api/groups/:groupId/membership)
router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // get currUserId + groupId
    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;

    // get group
    const group = await Group.findByPk(groupId);
    if (!group) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // get existingMembership
    const existingMembership = await Membership.findOne({
        where: { userId: currUserId, groupId: groupId }
    });

    // if currUser is not yet a member of group
    if (!existingMembership) {
        // create pending membership
        await Membership.bulkCreate([{
            userId: currUserId,
            groupId: groupId,
            status: 'pending'
        }], { validate: true });

        // get just-created membership, to get createdMember.id
        const createdMember = await Membership.findOne({
            where: {
                userId: currUserId,
                groupId: groupId,
                status: 'pending'
            }
        });

        // create newMembershipObj
        const newMembershipObj = {
            memberId: createdMember.id,
            groupId: createdMember.groupId,
            status: createdMember.status
        };

        // return 200 + newMembershipObj
        res.status(200);
        return res.json(newMembershipObj);
    };

    // if currUser already has membership in group (pending)
    if (existingMembership.status === 'pending') {
        res.status(400); // return 400 + 'bad request' message
        return res.json({ message: `Membership has already been requested (pending)` });
    };

    // if currUser already has membership in group (host, co-host, or member)
    if (existingMembership.status === 'host' ||
        existingMembership.status === 'co-host' ||
        existingMembership.status === 'member') {
        res.status(400); // return 400 + 'bad request' message
        return res.json({ message: `User is already a member of the group` });
    };
});


// URL validator (if any check is empty or incorrect, error is returned as response)
const validateURL = [
    check('url')
        .exists({ checkFalsy: true })
        .isURL() // prev: .notEmpty()
        .withMessage(`Image URL must be valid (must end in .png, .jpg, or .jpeg)`),
    handleValidationErrors
];


// Add an Image to a Group based on the Group's id (POST /api/groups/:groupId/images)
router.post('/:groupId/images', requireAuth, validateURL, async (req, res) => {
    const { user } = req; // get user from request
    if (!user) { // 'if (!user)' should not run, since 'requireAuth' will catch any reqs lacking authentication
        res.status(401); // but if 'requireAuth' didn't work, this would be a failsafe/backup
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const { url, preview } = req.body;
    const groupId = req.params.groupId;

    // get group
    const groupToAddImage = await Group.findByPk(groupId);
    if (!groupToAddImage) { // if no group
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Group couldn't be found` });
    };

    // if trying to add image to group organized by another user
    if (!(currUserId === groupToAddImage.organizerId)) { // if currUser is not groupOrganizer
        res.status(403); // return 403 + 'forbidden' message
        return res.json({ message: `Forbidden: User must be the group organizer to add an image.` });
    };

    // create group image
    await GroupImage.bulkCreate([{ groupId, url, preview },],
        { validate: true });

    // get just-created group image, to get createdGroupImage.id
    const createdGroupImage = await GroupImage.findOne({
        where: { groupId, url, preview }
    });

    // create addedImageObj
    const addedImageObj = {
        id: createdGroupImage.id,
        url: createdGroupImage.url,
        preview: createdGroupImage.preview
    };

    // return 200 + addedImageObj
    res.status(200);
    return res.json(addedImageObj);
});


// Delete a Group (DELETE /api/groups/:groupId)
router.delete('/:groupId', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;

    // get group
    const groupToDelete = await Group.findByPk(groupId);
    if (!groupToDelete) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // if currUser is not groupOrganizer
    if (!(currUserId === groupToDelete.organizerId)) {
        res.status(403); // return 403 + 'forbidden' message
        return res.json({ message: `Forbidden: Group must belong to the current user. User must be the group's organizer to delete it.` });
    };

    // if currUser is groupOrganizer
    await groupToDelete.destroy(); // delete group
    res.status(200); // return 200 + 'success' message
    return res.json({ message: `Successfully deleted` });
});


// for each variable (e.g. name):
// if the conditions are met to display a later message,
// then the later message will overwrite any earlier messages
// as long as the conditions for the later message are met
// group validator (if any check is empty or incorrect, error is returned as response)
const validateGroup = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .withMessage(`Name must be 60 characters or fewer`),
    check('name')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Name is required`),
    check('about')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Description is required`),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 30 })
        .withMessage(`Description must be 30 characters or more`),
    check('type')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Type is required`),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In person'])
        .withMessage(`Type must be 'In Person' or 'Online'`),
    check('privacy')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Privacy setting is required`),
    check('privacy')
        .exists({ checkFalsy: true })
        .isBoolean() // like .isIn([true, false])
        .withMessage(`Visibility must be 'Private' or 'Public'`), // ORIG: Privacy must be a boolean ('true' or 'false')
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`City is required`),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`State is required`),
    handleValidationErrors
];


// Change the status of a membership for a group specified by id (PUT /api/events/:groupId/membership)
router.put('/:groupId/membership', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const groupId = req.params.groupId;

    // get group
    const group = await Group.findByPk(groupId);
    if (!group) { // if no group
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Group couldn't be found` });
    };

    const { memberId, status } = req.body;
    const currUserId = user.dataValues.id;

    // get membership to edit
    const membership = await Membership.findOne({
        where: { groupId: groupId, userId: memberId }
    });

    // get membership that will perform the edit
    const currentUserMembership = await Membership.findOne({
        where: { groupId: groupId, userId: currUserId }
    });

    if (!membership) { // if no membership
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Membership between the user and the group does not exist` });
    };

    // get userOfInterest
    const userId = membership.userId;
    const userOfInterest = await User.findByPk(userId);

    // todo: possibly revise to 404
    // 400 Error: Couldn't find a User with the specified memberId
    if (!userOfInterest) { // if no userOfInterest
        res.status(400);
        return res.json({
            message: `Validation Error`,
            errors: {
                status: `User couldn't be found`
            }
        });
    }

    // 400 Error: Cannot change status to "pending"
    if (status === 'pending') { // if status from request is 'pending'
        res.status(400); // return 400 + 'bad request' message
        return res.json({
            message: `Validation Error`,
            errors: {
                status: `Cannot change a membership status to pending`
            }
        });
    };

    // Current User must be host or co-host of group that group belongs to

    // create host & coHost
    let host = false;
    if (currentUserMembership.status === 'host') host = true;
    let coHost = false;
    if (currentUserMembership.status === 'co-host') coHost = true;

    if (membership.status === 'pending' &&
        status === 'member' && // if updating from 'pending' to 'member'
        !host && !coHost) { // and currUser is NOT host or coHost
        res.status(403); // return 403 + 'forbidden' message
        return res.json({
            message: `Forbidden: Membership can only be updated by a group host or co-host`
        });

    } else if (membership.status === 'member' &&
        status === 'co-host' && // if updating from 'member' to 'co-host'
        !host) { // and currUser is NOT host
        res.status(403); // return 403 + 'forbidden' message
        return res.json({
            message: `Forbidden: Co-host membership can only be updated by a group host`
        });

    } else if (membership.status === 'pending' &&
        status === 'member' && // if updating from 'pending' to 'member'
        (host || coHost)) { // and currUser is host or coHost
        membership.userId = memberId;
        membership.status = status;
        await membership.save(); // save updated membership to DB

        // get just-updated membership, to get updatedMembership.id
        const updatedMembership = await Membership.findOne({
            where: { userId: memberId, status: status }
        });

        // create membershipObj
        const membershipObj = {
            id: updatedMembership.id,
            groupId,
            memberId,
            status
        };
        res.status(200); // return 200 + membershipObj
        return res.json(membershipObj);

    } else if (status !== 'pending' && // if updating status to anything but 'pending'
        host) { // and currUser is host
        membership.userId = memberId;
        membership.status = status;
        await membership.save(); // save updated membership to DB

        // get just-updated membership, to get updatedMembership.id and userId
        const updatedMembership = await Membership.findOne({
            where: { userId: memberId, status: status }
        });

        // create membershipObj
        const membershipObj = {
            id: updatedMembership.id,
            groupId,
            memberId: updatedMembership.userId,
            status
        };
        res.status(200); // return 200 + membershipObj
        return res.json(membershipObj);
    }
});


// Edit a Group (PUT /api/groups/:groupId)
router.put('/:groupId', requireAuth, validateGroup, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // get currUserId, groupId, and updated group info from req
    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId;
    const { name, about, type, privacy, city, state } = req.body;

    // get group
    const groupToUpdate = await Group.findByPk(groupId);
    if (!groupToUpdate) { // if no group
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Group couldn't be found` });
    };

    // if trying to edit group organized by another user
    // currUser must be organizer of group to edit it
    if (!(currUserId === groupToUpdate.organizerId)) { // if currUser is not groupOrganizer
        res.status(403); // return 403 + 'forbidden' message
        return res.json({
            message: `Forbidden: Group must belong to the current user. User must be the group's organizer to update it.`
        });
    };

    // update group properties + save to DB
    groupToUpdate.name = name;
    groupToUpdate.about = about;
    groupToUpdate.type = type;
    groupToUpdate.privacy = privacy;
    groupToUpdate.city = city;
    groupToUpdate.state = state;
    await groupToUpdate.save();

    // query DB for just-updated group, to get new 'updatedAt'
    const updatedGroup = await Group.findByPk(groupId);

    // return 200 + updatedGroup
    res.status(200);
    return res.json(updatedGroup);
});


// Create a Group (POST /api/groups)
router.post('/', requireAuth, validateGroup, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // get userId & new group info from req
    const userId = user.dataValues.id;
    const { name, about, type, privacy, city, state } = req.body;

    // get refGroup to determine refGroupIdPlusOne
    let refGroup = await Group.findOne({
        order: [['id', 'DESC']],
    });
    !refGroup ? refGroup = { dataValues: { id: 1 } } : refGroup;
    // const refGroupId = refGroup.dataValues.id;
    const refGroupIdPlusOne = refGroup.dataValues.id + 1;

    // create group
    await Group.bulkCreate([
        {
            id: refGroupIdPlusOne,
            organizerId: userId,
            name,
            about,
            type,
            privacy,
            city,
            state
        },
    ], { validate: true });

    // query DB for just-created group to get its:
    // id, createdAt, updatedAt
    const createdGroup = await Group.findOne({
        where: { id: refGroupIdPlusOne }
    });

    // get createdGroupObj & createdGroupId
    const createdGroupObj = createdGroup.dataValues;
    const createdGroupId = createdGroup.dataValues.id;

    // for user who created group: create host membership in group
    await Membership.bulkCreate([
        {
            userId: userId,
            groupId: createdGroupId,
            status: 'host'
        },
    ], { validate: true });

    // return 201 + createdGroupId
    res.status(201);
    return res.json(createdGroupObj);
});


// Get all Groups joined or organized by the Current User (GET /api/groups/current)
// (return all groups created by current user, OR where current user has a membership)
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // create allGroupsObj, to collect all groups associated with currUser
    let allGroupsObj = { Groups: [] };

    // get currUserId
    const currUserId = user.dataValues.id;

    // get all groups, including models for Membership & GroupImage
    const groupsOrig = await Group.findAll({
        include: [
            { model: Membership }, // removed: where: { userId: currUserId } (& do not need as "currUserId")
            { model: GroupImage }
        ]
    });

    // collect JSON version of all groups
    let groups = [];
    groupsOrig.forEach(group => {
        groups.push(group.toJSON());
    });

    // 1. get all Memberships
    // 2. get Memberships where: { userId: currUserId }
    // 3. get groupId for each Membership where: { userId: currUserId }
    // 4. for each group, get count of Memberships with that groupId (numMembers)

    // for each group
    groups.forEach(group => {
        // add numMembers to group
        membershipsArr = group.Memberships;
        group.numMembers = membershipsArr.length;
        delete group.Memberships;

        // add previewImage to group (URL, or 'not found' message)
        group.GroupImages.forEach(image => {
            if (image.preview === true) { // if previewImage is found
                group.previewImage = image.url;
            };
        });
        if (!group.previewImage) { // if previewImage is NOT found
            group.previewImage = 'No preview image found';
        };
        delete group.GroupImages;

        // collect userIds of all group members
        let allUserIdsInGroupMemberships = [];
        membershipsArr.forEach(membership => {
            const id = membership.userId;
            allUserIdsInGroupMemberships.push(id);
        });

        // if currUser is a member of group
        if (allUserIdsInGroupMemberships.includes(currUserId)) {
            allGroupsObj.Groups.push(group); // add group to allGroupsObj
        };
    });

    // return allGroupsObj,
    // fully populated with all groups created by currUser, OR where currUser is a member
    return res.json(allGroupsObj); // allGroupsObj: { Groups: [] }
});


////// Should be resolved, but double-check to be sure:
// Creating & updating venues - seems like we get the correct responses,
// but the new venue does not show in either:
// GET group details by id/ groups by current user endpoints, or in GET all venues by group id.
// It seems like we do create the venue, so issue might be in queries.
// Start by looking at dev.db: see if venue data has proper ids saved in appropriate cols.
// -- 'Get details of a Group' was not getting all venues after creating one.
// -- NOW SEEMS FIXED

// Get details of a Group from an id (GET /api/groups/:groupId)
router.get('/:groupId', async (req, res) => {
    // get group
    const groupId = req.params.groupId;
    const groupOrig = await Group.findByPk(groupId, {
        include: [
            // { model: GroupImage },
            // { model: User }, // this one is causing problem
            // { model: Venue },
        ]
    });

    if (!groupOrig) { // if no group
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Group couldn't be found` });
    };

    // todo: double-check adding const had no side effects
    const group = groupOrig.toJSON(); // convert to JSON

    // create num of totalMembers
    const memberships = await Membership.findAll();
    const membersArr = memberships.filter(membership => {
        return membership.groupId === group.id;
    });
    const totalMembers = membersArr.length;

    // create groupImagesArr (to hold all images for group)
    const groupImagesArr = [];
    const groupImagesArrOrig = await GroupImage.findAll({
        where: { groupId: groupId }
    });
    // const groupImagesArrOrig = group.GroupImages; // want to remove groupId from orig
    // for each group image
    groupImagesArrOrig.forEach(image => {
        const imageObj = { // create imageObj
            id: image.id,
            url: image.url,
            preview: image.preview
        };
        // add imageObj to groupImagesArr
        groupImagesArr.push(imageObj);
    });

    // create organizerObj (to hold group organizer id, firstname, lastname)
    const users = await User.findAll(); // get all users
    const usersArr = users.filter(user => {
        return user.id === group.organizerId;
    }); // find user who is group organizer
    const user = usersArr[0];
    const organizerObj = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
    };

    // create venuesArr (to hold all venues for group)
    const venuesArr = []; // arr of objs
    const venuesArrOrig = await Venue.findAll({
        where: { groupId: groupId }
    });
    // const venuesArrOrig = group.Venues;
    // for each venue
    venuesArrOrig.forEach(venue => {
        // create venueObj, then add properties
        const venueObj = {};
        venueObj.id = venue.id;
        venueObj.groupId = venue.groupId;
        venueObj.address = venue.address;
        venueObj.city = venue.city;
        venueObj.state = venue.state;
        venueObj.lat = venue.lat;
        venueObj.lng = venue.lng;
        // add venueObj to venuesArr
        venuesArr.push(venueObj);
    });

    // create groupObj (to hold info for group, numMembers, GroupImages, Organizer, Venues)
    const groupObj = { // manually creating obj helps ensure ideal order
        id: group.id,
        organizerId: group.organizerId,
        name: group.name,
        about: group.about,
        type: group.type,
        privacy: group.privacy,
        city: group.city,
        state: group.state,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        numMembers: totalMembers,
        GroupImages: groupImagesArr,
        Organizer: organizerObj,
        Venues: venuesArr
    };

    // return 200 + groupObj
    res.status(200);
    return res.json(groupObj);
});


// Get all Groups (GET /api/groups)
router.get('/', async (req, res) => {
    // create allGroupsObj to hold all groups
    let allGroupsObj = { Groups: [] };

    // query DB for all groups, including models for Membership & GroupImage
    const groupsOrig = await Group.findAll({
        include: [
            { model: Membership },
            { model: GroupImage }
        ]
    });

    // for each group, convert to JSON (not sure needed; keep to be safe)
    let groupsList = [];
    groupsOrig.forEach(group => {
        groupsList.push(group.toJSON());
    });

    // for each group
    groupsList.forEach(group => {
        // add numMembers to group
        const membershipsArr = group.Memberships;
        group.numMembers = membershipsArr.length;
        delete group.Memberships;

        // add previewImage to group (URL, or 'not found' message)
        group.GroupImages.forEach(image => {
            if (image.preview === true) { // if previewImage is found
                group.previewImage = image.url;
            };
        });
        if (!group.previewImage) { // if previewImage NOT found
            group.previewImage = 'No preview image found';
        };
        delete group.GroupImages;

        // add group to allGroupsObj.Groups
        allGroupsObj.Groups.push(group);
    });

    // return allGroupsObj
    return res.json(allGroupsObj); // allGroupsObj: { Groups: [] }
});


module.exports = router;
