// resources for route paths beginning in: /api/groups

const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, Organizer, Venue } = require('../../db/models');

const router = express.Router();

// // GET GROUPS FOR CURRENT USER (GET /api/groups/current)
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

// Get details of a Group from an id (GET /api/groups/:groupId)
router.get('/:groupId', async (req, res) => {

    const group = await Group.findByPk(req.params.groupId,
        {
            include: [
                { model: GroupImage },
                // { model: Organizer }, // this one is causing problem
                { model: Venue },
            ]
        }
    );

    // creating numMembers:
    const memberships = await Membership.findAll();

    const membersArr = memberships.filter(membership => {
        return membership.groupId === group.id; // fixed by adding 'return'
    });

    const groupObj = {
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
        numMembers: membersArr.length, // add
        GroupImages: group.GroupImages, // add
        // Organizer: group.Organizer, // add
        Venues: group.Venues // add
    };

    return res.json(groupObj);
});

// GET ALL GROUPS (GET /api/groups)
router.get('/', async (req, res) => {
    let allGroupsObj = { Groups: [] };

    const groupsOrig = await Group.findAll({ // ret arr of objs
        include: [{ model: GroupImage }] // remove this outer arr?
    });

    const memberships = await Membership.findAll();

    groupsOrig.forEach(group => {

        // creating numMembers:

        const membersArr = memberships.filter(membership => {
            return membership.groupId === group.id; // fixed by adding 'return'
        });

        const groupObj = {
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
            numMembers: membersArr.length // add numMembers prop
        };

        // creating previewImage:

        group.GroupImages.forEach(image => {

            if (image.preview === true) {
                groupObj.previewImage = image.url // add previewImage prop
            } else {
                groupObj.previewImage = 'No preview image found'
            }
        });

        allGroupsObj.Groups.push(groupObj);
    });

    return res.json(allGroupsObj);
});







module.exports = router;







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
