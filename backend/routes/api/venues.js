// resources for route paths beginning in: /api/venues
const express = require('express');
const { Op } = require('sequelize');
const { Membership, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();

// venue validator
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
        .isDecimal() // todo: see about how to use .isLatLong()
        .withMessage(`Latitude is not valid`),
    check('lng')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage(`Longitude is required`),
    check('lng')
        .exists({ checkFalsy: true })
        .isDecimal() // todo: see about how to use .isLatLong()
        .withMessage(`Longitude is not valid`),
    handleValidationErrors
];


// Edit a Venue specified by its id (PUT /api/venues/:venueId)
router.put('/:venueId', requireAuth, validateVenue, async (req, res) => {
    const { user } = req;
    if (!user) { // shouldn't run, since requireAuth should catch issues first (but here as backup)
        res.status(401);
        return res.json({ message: `Authentication Required. No user is currently logged in.` });
    };

    // get currUserId, venueId, and updated venue info from req
    const currUserId = user.dataValues.id;
    const venueId = req.params.venueId;
    const { address, city, state, lat, lng } = req.body;

    // get venueToUpdate
    const venueToUpdate = await Venue.findByPk(venueId);
    if (!venueToUpdate) { // if no venue
        res.status(404); // return 404 + 'not found' message
        return res.json({ message: `Venue couldn't be found` });
    };

    // determine if currUser is group hostOrCoHost
    const groupId = venueToUpdate.groupId;
    const hostOrCoHost = await Membership.findAll({
        where: {
            userId: currUserId,
            groupId: groupId,
            status: { [Op.in]: ['host', 'co-host'] }
        }
    });

    if (hostOrCoHost.length === 0) { // if currUser is NOT group hostOrCoHost
        res.status(403); // return 403 + 'forbidden' message
        return res.json({
            message: `Forbidden: User must be group organizer or co-host to edit a venue`
        });
    };

    // update venue & save to DB
    venueToUpdate.address = address;
    venueToUpdate.city = city;
    venueToUpdate.state = state;
    venueToUpdate.lat = lat;
    venueToUpdate.lng = lng;
    await venueToUpdate.save();

    // create updatedVenueObj, then add properties with updated info from the request body
    const updatedVenueObj = {};
    updatedVenueObj.id = venueId;
    updatedVenueObj.groupId = venueToUpdate.groupId;
    updatedVenueObj.address = address;
    updatedVenueObj.city = city;
    updatedVenueObj.state = state;
    updatedVenueObj.lat = lat;
    updatedVenueObj.lng = lng;

    // return 200 + updatedVenueObj
    res.status(200);
    return res.json(updatedVenueObj);

    // todo: consider coming back to some ideas here

    // many to many: venues-to-groups, via events
    // one venue belongsToMany groups
    // one group belongsToMany venues

    // find all events using this venue -- where: { venueId: venueId }
    // for each event, push event's groupId into groupIdsArr
    // for each groupId in groupIdsArr, check if id is in isHostOrCoHost
});


module.exports = router;
