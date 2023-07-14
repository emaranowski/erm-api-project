// resources for route paths beginning in: /api/group-images
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();




// Delete an Image for a Group (DELETE /api/group-images/:imageId)
router.delete('/:imageId', requireAuth, async (req, res) => {

    // get imageId
    const imageId = req.params.imageId;

    // get image to delete
    const imageToDelete = await GroupImage.findByPk(imageId);

    // if no image w/ specified id
    if (!imageToDelete) {
        res.status(404);
        return res.json({ message: `Group Image couldn't be found` });
    };

    // get groupId
    const group = await Group.findOne({ where: { id: imageId } });
    const groupId = group.id;

    // get userId
    const { user } = req;
    const userId = user.dataValues.id;

    // get membership
    const membership = await Membership.findOne({
        where: {
            userId: userId,
            groupId: groupId,
            status: {
                [Op.in]: ['host', 'co-host']
            }
        }
    });

    // Current user must be "host" or "co-host" of group
    if (!membership) {
        res.status(403);
        return res.json({
            message: `User must be a group organizer or co-host to delete a Group Image.`
        });
    };

    // //
    // const hostOrCoHost = [];
    // allMemberships.forEach(membership => {

    //     if (membership.userId === currUserId &&
    //         (membership.status === 'host' || membership.status === 'co-host')
    //     ) {
    //         hostOrCoHost.push(membership.status)
    //     }
    // });

    await imageToDelete.destroy();
    res.status(200);
    return res.json({ message: `Successfully deleted` });
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

module.exports = router;
