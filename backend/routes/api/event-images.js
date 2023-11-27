// resources for route paths beginning in: /api/event-images
const express = require('express');
const { Op } = require('sequelize');
const { Membership, Event, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();


// Delete an Image for an Event (DELETE /api/event-images/:imageId)
router.delete('/:imageId', requireAuth, async (req, res) => {

  const imageId = req.params.imageId; // get imageId from URI parameters
  const image = await EventImage.findByPk(imageId); // get image to delete

  if (!image) { // if no image w/ that id, return 404 + 'not found' message
    res.status(404);
    return res.json({ message: `Event Image couldn't be found` });
  };

  const { user } = req; // get current user from request
  const userId = user.dataValues.id; // get userId from user

  const eventId = image.eventId; // get eventId from image
  const event = await Event.findByPk(eventId); // get event
  const groupId = event.groupId; // get groupId from event

  const membership = await Membership.findOne({ // get group membership
    where: { // must match userId & groupId, and have status of host/organizer or co-host
      userId: userId,
      groupId: groupId,
      status: {
        [Op.in]: ['host', 'co-host']
      }
    }
  });

  // if current user is not host/organizer or co-host of group that owns event:
  if (!membership) { // return 403 + 'forbidden' message
    res.status(403);
    return res.json({ message: `Forbidden: User must be a group organizer or co-host to delete a Event Image.` });
  };

  // if all conditions are met:
  await image.destroy(); // delete image
  res.status(200); // return 200 + 'success' message
  return res.json({ message: `Successfully deleted` });
});


module.exports = router;
