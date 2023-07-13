// resources for route paths beginning in: /api/groups
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
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res) => {

    const { user } = req;
    if (!user) { // should not run, since requireAuth should catch issues first (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const groupId = req.params.groupId;

    const groupToAddEvent = await Group.findByPk(groupId);
    if (!groupToAddEvent) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // find all memberships where: { groupId: groupId, userId: currUserId, status: 'co-host' }
    // find all group memberships where userId: currUserId
    const userIsCoHost = await Membership.findAll(
        {
            where: { groupId: groupId, userId: currUserId, status: 'co-host' }
        }
    ); // maybe come back and make more elegant by doing Op.in for status 'host' or 'co-host'

    // COME BACK TO THIS
    if (!(currUserId === groupToAddEvent.organizerId) && !userIsCoHost) { // if either is false
        res.status(403);
        return res.json({ message: `User must be a group organizer or co-host to add an event.` });
    };

    // if ((currUserId === groupToAddEvent.organizerId) || userIsCoHost) { // if either is true
    //     await Event.bulkCreate([{ groupId, address, city, state, lat, lng }],
    //         { validate: true });
    // };

    await Event.bulkCreate([{ venueId, groupId, name, type, capacity, price, description, startDate, endDate }],
        { validate: true });

    const createdGroupEvent = await Event.findOne({ // to get createdGroupEvent.id
        where: { venueId, groupId, name, type, capacity, price, description, startDate, endDate }
    });

    const event = {};
    event.id = createdGroupEvent.id;
    event.groupId = createdGroupEvent.groupId;
    event.venueId = createdGroupEvent.venueId;
    event.name = createdGroupEvent.name;
    event.type = createdGroupEvent.type;
    event.capacity = createdGroupEvent.capacity;
    event.price = createdGroupEvent.price;
    event.description = createdGroupEvent.description;
    event.startDate = createdGroupEvent.startDate;
    event.endDate = createdGroupEvent.endDate;

    res.status(200);
    return res.json(event);
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

    // groupEventsObj.Events = allGroupEventsArr;

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
        .withMessage(`Latitude is required`),
    check('lat')
        .exists({ checkFalsy: true })
        .isDecimal() // try to figure out how to use .isLatLong()
        .withMessage(`Latitude is not valid`),
    check('lng')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Longitude is required`),
    check('lng')
        .exists({ checkFalsy: true })
        .isDecimal() // try to figure out how to use .isLatLong()
        .withMessage(`Longitude is not valid`),
    handleValidationErrors
]; // if any one is wrong, err is ret as res

// Create a new Venue for a Group specified by its id (POST /api/groups/:groupId/venues) -- DRAFT V1
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res) => {
    const { user } = req;
    if (!user) { // should not run, since requireAuth should catch issues first (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const { address, city, state, lat, lng } = req.body;
    const groupId = req.params.groupId;

    const groupToAddVenue = await Group.findByPk(groupId);
    if (!groupToAddVenue) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // find all memberships where: { groupId: groupId, userId: currUserId, status: 'co-host' }
    // find all group memberships where userId: currUserId
    const userIsCoHost = await Membership.findAll(
        {
            where: { groupId: groupId, userId: currUserId, status: 'co-host' }
        }
    ); // maybe come back and make more elegant by doing Op.in for status 'host' or 'co-host'

    // console.log('////////////////////////////////')
    // console.log(`***** userIsCoHost:`)
    // console.log(userIsCoHost)
    // console.log('////////////////////////////////')


    // COME BACK TO THIS
    if (!(currUserId === groupToAddVenue.organizerId) && !userIsCoHost) { // if either is false
        res.status(403);
        return res.json({ message: `User must be a group organizer or co-host to add a venue.` });
    };

    // if ((currUserId === groupToAddVenue.organizerId) || userIsCoHost) { // if either is true
    //     await Venue.bulkCreate([{ groupId, address, city, state, lat, lng }],
    //         { validate: true });
    // };

    await Venue.bulkCreate([{ groupId, address, city, state, lat, lng }],
        { validate: true });

    const createdGroupVenue = await Venue.findOne({ // to get venue id
        where: { groupId, address, city, state, lat, lng }
    });

    const addedVenue = {};
    addedVenue.id = createdGroupVenue.id;
    addedVenue.groupId = createdGroupVenue.groupId;
    addedVenue.address = createdGroupVenue.address;
    addedVenue.city = createdGroupVenue.city;
    addedVenue.state = createdGroupVenue.state;
    addedVenue.lat = createdGroupVenue.lat;
    addedVenue.lng = createdGroupVenue.lng;

    res.status(200);
    return res.json(addedVenue);
});


// Get All Venues for a Group specified by its id (GET /api/groups/:groupId/venues) -- V1
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    let allGroupVenuesObj = { Venues: [] };

    const { user } = req; // pull user from req
    if (!user) { // should not run, since requireAuth should catch issues first (but here as backup)
        res.status(401); // Unauthorized/Unauthenticated
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const groupId = req.params.groupId;
    const groupOfInterest = await Group.findByPk(groupId, {
        include: [
            { model: Venue }
        ]
    });
    if (!groupOfInterest) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    };

    // console.log('////////////////////////////////')
    // console.log(`***** groupOfInterest:`)
    // console.log(groupOfInterest)
    // console.log('////////////////////////////////')

    const groupVenuesArrOrig = groupOfInterest.dataValues.Venues;

    // console.log('////////////////////////////////')
    // console.log(`***** groupOfInterest.dataValues.Venues:`)
    // console.log(groupOfInterest.dataValues.Venues)
    // console.log('////////////////////////////////')

    groupVenuesArrOrig.forEach(groupVenue => {

        // console.log('////////////////////////////////')
        // console.log(`***** groupVenue:`)
        // console.log(groupVenue)
        // console.log('////////////////////////////////')

        // console.log('////////////////////////////////')
        // console.log(`***** groupVenue.dataValues.address:`)
        // console.log(groupVenue.dataValues.address)
        // console.log('////////////////////////////////')

        const { id, groupId, address, city, state, lat, lng } = groupVenue.dataValues;

        const groupVenueObj = { id, groupId, address, city, state, lat, lng };

        // const groupVenueObj2 = { // also works, just longer
        //     id: groupVenue.dataValues.id,
        //     groupId: groupVenue.dataValues.groupId,
        //     address: groupVenue.dataValues.address,
        //     city: groupVenue.dataValues.city,
        //     state: groupVenue.dataValues.state,
        //     lat: groupVenue.dataValues.lat,
        //     lng: groupVenue.dataValues.lng,
        // };

        allGroupVenuesObj.Venues.push(groupVenueObj);
    });

    res.status(200);
    return res.json(allGroupVenuesObj);
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
        return res.json({ message: `Group must belong to the current user. User must be the group's organizer to delete it.` });
    };

    await GroupImage.bulkCreate([{ groupId, url, preview },],
        { validate: true });

    const createdGroupImage = await GroupImage.findOne({
        where: { groupId, url, preview }
    });

    const addedImage = {
        id: createdGroupImage.id,
        url: createdGroupImage.url,
        preview: createdGroupImage.preview
    };
    res.status(200);
    return res.json(addedImage);
});



// Delete a Group (DELETE /api/groups/:groupId) -- V1
router.delete('/:groupId', requireAuth, async (req, res) => {
    const { user } = req; // pull user from req
    // 'if (!user)' should not run, since 'requireAuth' will catch any reqs lacking authentication
    // but if 'requireAuth' didn't work, this would be a failsafe/backup
    if (!user) {
        res.status(401); // Unauthorized/Unauthenticated
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const groupId = req.params.groupId; // params, not query

    const groupToDelete = await Group.findByPk(groupId);
    if (!groupToDelete) {
        res.status(404); // Not Found
        return res.json({ message: `Group couldn't be found` });
    };

    // If logged in, but trying to delete group organized by another user....
    if (!(currUserId === groupToDelete.organizerId)) {
        res.status(403); // Forbidden -- or is this 401 Unauthorized/Unauthenticated ?????
        return res.json({ message: `Group must belong to the current user. User must be the group's organizer to delete it.` });
    };

    // DELETION HERE
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
        return res.json({ message: `Group must belong to the current user. User must be the group's organizer to update it.` });
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

    const currUserId = user.dataValues.id;
    const { name, about, type, private, city, state } = req.body;

    await Group.bulkCreate([
        {
            organizerId: currUserId,
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
            organizerId: currUserId,
            name: name,
            about: about,
            type: type,
            private: private,
            city: city,
            state: state
        }
    });

    res.status(201);
    return res.json(createdGroup);
});

// // Get all Groups joined or organized by the Current User (GET /api/groups/current) -- V3
// Return all groups created by current user, or where current user has a membership.
// require authentication: TRUE
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



// Get details of a Group from an id (GET /api/groups/:groupId) -- V1
router.get('/:groupId', async (req, res) => {

    const groupOrig = await Group.findByPk(req.params.groupId,
        {
            include: [
                { model: GroupImage },
                // { model: User }, // this one is causing problem
                { model: Venue },
            ]
        }
    );

    // Error response: Couldn't find a Group with the specified id
    if (!groupOrig) {
        res.status(404);
        return res.json({ message: `Group couldn't be found` });
    }

    // convert to JSON
    group = groupOrig.toJSON();

    // create numMembers val (totalMembers):
    let totalMembers;
    const memberships = await Membership.findAll(); // QUERY DB
    const membersArr = memberships.filter(membership => {
        return membership.groupId === group.id;
    });
    totalMembers = membersArr.length;

    // create GroupImages val (groupImagesArr):
    let groupImagesArr = [];
    const groupImagesArrOrig = group.GroupImages; // want to remove groupId from orig
    groupImagesArrOrig.forEach(image => {
        const imageObj = {};
        imageObj.id = image.id;
        imageObj.url = image.url;
        imageObj.preview = image.preview;

        groupImagesArr.push(imageObj);
    });

    // create Organizer val (organizerObj):
    let organizerObj = {};
    const users = await User.findAll(); // QUERY DB
    const usersArr = users.filter(user => {
        return user.id === group.organizerId;
    });
    const user = usersArr[0];
    organizerObj.id = user.id;
    organizerObj.firstName = user.firstName;
    organizerObj.lastName = user.lastName;

    // create Venues val (venuesArr):
    let venuesArr = [];
    const venuesArrOrig = group.Venues;
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

    // NOTES:
    // ideally do more efficiently, w/o querying db for:
    // await Membership
    // await User

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
