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

    const allMemberships = await Membership.findAll();
    const hostOrCoHost = [];
    allMemberships.forEach(membership => {

        if (membership.userId === currUserId &&
            (membership.status === 'host' || membership.status === 'co-host')
        ) {
            hostOrCoHost.push(membership.status)
        }
    });

    // Error: Couldn't find an Image with the specified id

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
