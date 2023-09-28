// resources for route paths beginning in: /api/event-images
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();


// Delete an Image for an Event (DELETE /api/event-images/:imageId)
router.delete('/:imageId', requireAuth, async (req, res) => {

    // get imageId
    const imageId = req.params.imageId;
    const image = await EventImage.findByPk(imageId); // get image to delete

    // if no image w/ specified id
    if (!image) {
        res.status(404);
        return res.json({ message: `Event Image couldn't be found` });
    };

    // get eventId
    const eventId = image.eventId;
    const event = await Event.findByPk(eventId);

    // get groupId
    const groupId = event.groupId;
    const group = await Group.findByPk(groupId);

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

    // Current user must be "host" or "co-host" of Group that Event belongs to
    if (!membership) {
        res.status(403);
        return res.json({
            message: `Forbidden: User must be a group organizer or co-host to delete a Event Image.`
        });
    };

    await image.destroy();
    res.status(200);
    return res.json({ message: `Successfully deleted` });
});


module.exports = router;
