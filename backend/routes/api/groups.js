// resources for route paths beginning in: /api/groups
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();



// Delete a Group (DELETE /api/groups/:groupId) -- DRAFT V1
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
