// resources for route paths beginning in: /api/groups

const express = require('express');
const { Group, Membership, GroupImage } = require('../../db/models');

const router = express.Router();

// GET ALL GROUPS (GET /api/groups)
router.get('/', async (req, res) => {

    const groups = await Group.findAll();

    return res.json(groups);

});

// GET ALL GROUPS (GET /api/groups)
// router.get('/', async (req, res) => {

//     const groups = await Group.findAll(
//         {
//             include: [
//                 { model: Membership },
//                 { model: GroupImage }
//             ]
//         }
//     );

//     let groupsObj = {
//         Groups: {}
//     };

//     groups.forEach(group => {
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
//             // numMembers: 000,
//             // previewImage: 'image url',
//         }

//         groupsObj.Groups.push(); // add each group as an obj to
//     });

//     return res.json(groupsObj);

//     // will need to add numMembers int & previewImage str 'url'
// });

module.exports = router;
