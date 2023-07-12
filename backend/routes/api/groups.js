// resources for route paths beginning in: /api/groups
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const router = express.Router();

// // Get all Groups joined or organized by the Current User (GET /api/groups/current) -- DRAFT V2
// Return all groups created by current user, or where current user has a membership.
// require authentication: TRUE
// test if shows 2 groups, after adding a group to User 1
router.get('/current', async (req, res) => {
    const { user } = req; // pull user from req

    // console.log('////////////////////////////////')
    // console.log(`***** user:`)
    // console.log(user)
    // console.log('////////////////////////////////')

    if (!user) {
        res.status(404); // change to client-side error code
        return res.json({ message: `No user is currently logged in` });
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
            { model: Membership, where: { userId: currUserId } }, // do not need as "currUserId"
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

    groups.forEach(group => {
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


// // // Get all Groups joined or organized by the Current User (GET /api/groups/current) -- DRAFT V1
// // Return all groups created by current user, or where current user has a membership.
// // require authentication: TRUE
// // test if shows 2 groups, after adding a group to User 1
// router.get('/current', async (req, res) => {
//     const { user } = req; // pull user from req
//     const currUserId = user.dataValues.id;

//     console.log('////////////////')
//     console.log(`currUserId: `, currUserId)
//     console.log('////////////////')

//     if (!user) {
//         res.status(404);
//         return res.json({ message: `No user is currently logged in` });
//     };

//     let allGroupsObj = { Groups: [] };

//     const groupsOrig = await Group.findAll({
//         where: { organizerId: currUserId },
//         include: [
//             { model: Membership, where: { groupId: currUserId } }, // may need ""
//             { model: GroupImage },
//         ]
//     });
//     let groups = [];
//     groupsOrig.forEach(group => {
//         groups.push(group.toJSON()); // convert to JSON
//     });

//     groups.forEach(group => {
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

// // Get all Groups joined or organized by the Current User (GET /api/groups/current) -- ORIG DRAFT
// Return all groups either created by current user or those where current user has a membership.
// require authentication: TRUE
// router.get('/current', async (req, res) => {
//     let groupsObj = {};

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

//     groupsObj.Groups = currUserGroups;

//     return res.json(groupsObj);
// });




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
