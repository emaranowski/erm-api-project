// resources for route paths beginning in: /api/group-images
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();


// Delete an Image for a Group (DELETE /api/group-images/:imageId)
router.delete('/:imageId', requireAuth, async (req, res) => {

  const imageId = req.params.imageId; // get imageId
  const imageToDelete = await GroupImage.findByPk(imageId); // get image to delete

  if (!imageToDelete) { // if no image w/ specified id
    res.status(404);
    return res.json({ message: `Group Image couldn't be found` });
  };

  const group = await Group.findOne({ where: { id: imageId } }); // get group
  const groupId = group.id; // get groupId

  const { user } = req; // get user from request
  const userId = user.dataValues.id; // get userId

  const membership = await Membership.findOne({ // get membership
    where: {
      userId: userId,
      groupId: groupId,
      status: {
        [Op.in]: ['host', 'co-host']
      }
    }
  });

  // current user must be organizer/host or co-host of group
  if (!membership) {
    res.status(403);
    return res.json({
      message: `Forbidden: User must be a group organizer or co-host to delete a Group Image.`
    });
  };

  await imageToDelete.destroy();
  res.status(200);
  return res.json({ message: `Successfully deleted` });
});


module.exports = router;
