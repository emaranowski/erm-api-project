// resources for route paths beginning in: /api/venues
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();


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
];


// Edit a Venue specified by its id (PUT /api/venues/:venueId) -- DRAFT V1
router.put('/:venueId', requireAuth, validateVenue, async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(401); // Unauthorized/Unauthenticated
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    const currUserId = user.dataValues.id;
    const venueId = req.params.venueId;
    const { address, city, state, lat, lng } = req.body;

    const venueToUpdate = await Venue.findByPk(venueId);
    if (!venueToUpdate) {
        res.status(404);
        return res.json({ message: `Venue couldn't be found` });
    };

    // many to many: venues-to-groups, via events
    // one venue belongsToMany groups
    // one group belongsToMany venues

    // find all events using this venue -- where: { venueId: venueId }
    // for each event using this venue, push that event's groupId into groupIdsArr
    // for each id in groupIdsArr -- check if that id is in isHostOrCoHost


    const groupId = venueToUpdate.groupId;
    const hostOrCoHost = await Membership.findAll({
        where: {
            userId: currUserId,
            groupId: groupId,
            status: { [Op.in]: ['host', 'co-host'] }
        }
    });

    if (hostOrCoHost.length === 0) {
        res.status(403); // 403 Not Authorized: User must be group organizer or co-host to create an event
        return res.json({ message: `User must be group organizer or co-host to edit a venue` });
    };

    // // COME BACK TO THIS
    // if (!(currUserId === groupToAddEvent.organizerId) && !userIsCoHost) { // if either is false
    //     res.status(403);
    //     return res.json({ message: `User must be a group organizer or co-host to update its venue.` });
    // };

    // // if trying to edit venue of group hosted/co-hosted by another user....
    // if (!(currUserId === venueToUpdate.organizerId)) {
    //     res.status(403); // Forbidden -- or is this 401 Unauthorized/Unauthenticated ?????
    //     return res.json({ message: `User mustjfgjfgjfte its venue.` });
    // };

    // do updates here + save
    venueToUpdate.address = address;
    venueToUpdate.city = city;
    venueToUpdate.state = state;
    venueToUpdate.lat = lat;
    venueToUpdate.lng = lng;
    await venueToUpdate.save();

    // const updatedVenue = await Venue.findByPk(venueId); // to get updatedVenue.id

    // create updatedVenueObj
    const updatedVenueObj = {};
    updatedVenueObj.id = venueId;
    updatedVenueObj.groupId = venueToUpdate.groupId;
    updatedVenueObj.address = address;
    updatedVenueObj.city = city;
    updatedVenueObj.state = state;
    updatedVenueObj.lat = lat;
    updatedVenueObj.lng = lng;

    res.status(200);
    return res.json(updatedVenueObj);
});


module.exports = router;
