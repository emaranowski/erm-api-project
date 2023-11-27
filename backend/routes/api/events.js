// resources for route paths beginning in: /api/events
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();


// Add an Image to an Event based on the Event's id (POST /api/events/:eventId/images)
router.post('/:eventId/images', requireAuth, async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401);
    return res.json({ message: `Authentication Required. No user is currently logged in.` });
  };

  const userId = user.dataValues.id;
  const { url, preview } = req.body;
  const eventId = req.params.eventId;

  const event = await Event.findByPk(eventId, { include: [{ model: Group }] });
  if (!event) {
    res.status(404);
    return res.json({ message: `Event couldn't be found` });
  };

  groupId = event.groupId;

  // Current User must be event host, co-host, or attendee
  const memberships = await Membership.findAll({ include: [{ model: Group }] });
  const canAddImage = memberships.filter(member => {
    return member.userId === userId &&
      member.groupId === groupId &&
      (member.status === 'host' ||
        member.status === 'co-host');
  });

  const attendance = await Attendance.findOne({ where: { userId: userId, eventId: eventId } });
  if (attendance) canAddImage.push('attendee');

  if (canAddImage.length === 0) {
    res.status(403);
    return res.json({
      message: `Forbidden: User must be an attendee, host, or co-host of the event to add an image.`
    });
  };

  await EventImage.bulkCreate([{ eventId, url, preview },],
    { validate: true });

  const createdImage = await EventImage.findOne({ // to get id
    where: { eventId, url, preview }
  });

  const createdImageObj = {
    id: createdImage.id,
    url: createdImage.url,
    preview: createdImage.preview
  };
  res.status(200);
  return res.json(createdImageObj);
});


// Delete attendance to an event specified by id (DELETE /api/events/:eventId/attendance)
router.delete('/:eventId/attendance', requireAuth, async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401);
    return res.json({ message: `Authentication Required. No user is currently logged in.` });
  };

  const eventId = req.params.eventId;
  const event = await Event.findByPk(eventId, { include: [{ model: Group }] });
  if (!event) { // Error: Couldn't find an Event with the specified id
    res.status(404);
    return res.json({ message: `Event couldn't be found` });
  };

  const currUserId = user.dataValues.id; // -- from session
  const userId = req.body.userId; // -- from body

  const attendance = await Attendance.findOne( // attendance to delete
    { where: { eventId: eventId, userId: userId } }
  );
  if (!attendance) { // Error: Attendance does not exist for this User
    res.status(404);
    return res.json({ message: `Attendance does not exist for this User` });
  };

  // create isHost
  let isHost = false;
  const groupId = event.Group.id;
  const currUserHostMembership = await Membership.findOne({
    where: {
      userId: currUserId,
      groupId: groupId,
      status: 'host'
    }
  });
  if (currUserHostMembership) isHost = true;

  // create isDeletingSelf
  let isDeletingSelf = false;
  if (currUserId === userId) isDeletingSelf = true;

  // to delete attendance, currUser must be group host, or an attendee deleting self
  if (!isHost && !isDeletingSelf) { // if not host, and not attendee
    res.status(403); // return 403 + 'forbidde' message
    return res.json({ message: `Forbidden: Only the User or organizer may delete an Attendance` });
  };

  await attendance.destroy();

  res.status(200);
  return res.json({ message: `Successfully deleted attendance from event` });

  // was getting timeout/infinite loop at .destroy()
  // fixed by removing onDelete cascade from belongsTo side of associations
  // but kept it for hasMany side of associations for Event & EventImage
  // (did same on all other models as well)
  // however, kept onDelete cascade on all model constraints, on both sides, and seems fine
});


// Delete an Event (DELETE /api/events/:eventId)
router.delete('/:eventId', requireAuth, async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401);
    return res.json({ message: `Authentication Required. No user is currently logged in.` });
  };

  const eventId = req.params.eventId;
  const event = await Event.findByPk(eventId,
    {
      include: [
        { model: Group },
        { model: Venue },
      ]
    }
  );
  if (!event) {
    res.status(404);
    return res.json({ message: `Event couldn't be found` });
  };

  // Current user must be "host" or "co-host" of Group that Event belongs to
  const memberships = await Membership.findAll();
  const userId = user.dataValues.id;
  const groupId = event.Group.id;

  const hostOrCoHost = memberships.filter(member => {
    return member.userId === userId &&
      member.groupId === groupId &&
      (member.status === 'host' ||
        member.status === 'co-host');
  });

  if (hostOrCoHost.length === 0) {
    res.status(403);
    return res.json({
      message: `Forbidden: User must be a group's organizer or co-host to delete its events.`
    });
  };

  await event.destroy();

  res.status(200);
  return res.json({ message: `Successfully deleted` });
});


// Get all Attendees of an Event specified by its id (GET /api/events/:eventId/attendees)
router.get('/:eventId/attendees', async (req, res) => {
  let attendeesObj = { Attendees: [] };

  const { user } = req;
  const currUserId = user.dataValues.id;
  const eventId = req.params.eventId;

  const event = await Event.findByPk(eventId);
  if (!event) {
    res.status(404);
    res.json({ message: `Event couldn't be found` })
  };

  const allAttendances = await Attendance.findAll({ where: { eventId: eventId } });
  const allUsers = await User.findAll();

  // create hostOrCoHost
  const hostOrCoHost = [];
  allAttendances.forEach(attendance => {

    if (attendance.userId === currUserId &&
      (attendance.status === 'host' || attendance.status === 'co-host')
    ) {
      hostOrCoHost.push(attendance.status)
    }
  });

  // If user IS host/co-host, show attendees w/ status: host, co-host, member, pending
  if (hostOrCoHost.length === 1) {

    allAttendances.forEach(attendance => {

      const user = allUsers.filter(user => {
        return user.id === attendance.dataValues.userId;
      });

      const attendeeObj = {
        id: attendance.id,
        firstName: user[0].dataValues.firstName,
        lastName: user[0].dataValues.lastName,
        Attendance: {
          status: attendance.status
        }
      };

      attendeesObj.Attendees.push(attendeeObj);
    });
    res.status(200);
    return res.json(attendeesObj);
  };

  // If user IS NOT host/co-host, show attendances w/ status: attending, pending
  if (hostOrCoHost.length === 0) {

    allAttendances.forEach(attendance => {

      const user = allUsers.filter(user => {
        return user.id === attendance.dataValues.userId;
      });

      if (attendance.dataValues.status !== 'pending') {

        const attendeeObj = {
          id: attendance.id,
          firstName: user[0].dataValues.firstName,
          lastName: user[0].dataValues.lastName,
          Attendance: {
            status: attendance.status
          }
        };

        attendeesObj.Attendees.push(attendeeObj);
      };
    });
    res.status(200);
    return res.json(attendeesObj);
  };
});


// Request to Attend an Event based on the Event's id (POST /api/events/:eventId/attendance)
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401);
    return res.json({ message: `Authentication Required. No user is currently logged in.` });
  };

  const currUserId = user.dataValues.id;
  const eventId = req.params.eventId;

  const event = await Event.findByPk(eventId);
  if (!event) {
    res.status(404); // 404 Error: Couldn't find an Event with the specified id
    return res.json({ message: `Event couldn't be found` });
  };

  const groupId = event.groupId;
  const membership = await Membership.findOne({
    where: { userId: currUserId, groupId: groupId }
  });
  if (!membership) {
    res.status(403); // 403 Error: Current User must be a member of the group holding the event
    return res.json({ message: `Forbidden: To request attendance, user must be a member of the group holding the event` });
  };

  const existingAttendance = await Attendance.findOne({
    where: { userId: currUserId, eventId: eventId }
  });

  if (!existingAttendance) {
    await Attendance.bulkCreate([{
      eventId: eventId,
      userId: currUserId,
      status: 'pending'
    }], { validate: true });

    const createdAttendance = await Attendance.findOne({
      where: {
        eventId: eventId,
        userId: currUserId,
        status: 'pending'
      }
    });

    const createdAttendanceObj = {
      eventId: createdAttendance.eventId,
      userId: createdAttendance.userId,
      status: createdAttendance.status
    };

    res.status(200);
    return res.json(createdAttendanceObj);
  };

  if (existingAttendance.status === 'pending') {
    res.status(400); // 400 Error: Current User already has a pending attendance for the event
    return res.json({ message: `Attendance has already been requested (pending)` });
  };

  if (existingAttendance.status === 'attending') {
    res.status(400); // 400 Error: Current User is already an accepted attendee of the event
    return res.json({ message: `User is already an attendee of the event` });
  };
});


// event validator
const validateEvent = [
  check('venueId')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage(`Venue cannot be empty`),
  check('venueId')
    .exists({ checkFalsy: true })
    .isInt()
    .withMessage(`Venue must be an integer`),
  check('venueId')
    .exists({ checkFalsy: true })
    .custom(async value => {
      const venue = await Venue.findByPk(value);
      if (!venue) throw new Error();
    })
    .withMessage(`Venue does not exist`),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 5 })
    .withMessage(`Name must be at least 5 characters`),
  check('type')
    .exists({ checkFalsy: true })
    .isIn(['Online', 'In person'])
    .withMessage(`Type must be 'In Person' or 'Online'`),
  check('capacity')
    .exists({ checkFalsy: true })
    .isInt()
    .withMessage(`A number for capacity is required`),
  check('price')
    .exists({ checkFalsy: true })
    .isDecimal()
    .withMessage(`A number for price is required (type "0" if it's free!)`),
  check('description')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage(`Description is required`),
  check('description')
    .exists({ checkFalsy: true })
    .isLength({ min: 30 })
    .withMessage(`Description must be at least 30 characters`),
  check('startDate')
    .exists({ checkFalsy: true })
    .isAfter(Date.parse(Date.now()))
    .withMessage(`Start date must be in the future`),
  check('endDate')
    .exists({ checkFalsy: true })
    .isAfter(Date.parse(this.startDate))
    .withMessage(`End date must be after start date`),
  handleValidationErrors
]; // if any one is wrong, err is ret as res


// Change the status of an attendance for an event specified by id (PUT /api/events/:eventId/attendance)
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401);
    return res.json({ message: `Authentication Required. No user is currently logged in.` });
  };

  const eventId = req.params.eventId;
  const event = await Event.findByPk(eventId);
  if (!event) {
    res.status(404); // 404 Error: Couldn't find an Event with the specified id
    return res.json({ message: `Event couldn't be found` });
  };

  const { userId, status } = req.body;
  const currUserId = user.dataValues.id;
  const groupId = event.groupId;

  const hostOrCoHost = await Membership.findAll({
    where: {
      userId: currUserId,
      groupId: groupId,
      status: { [Op.in]: ['host', 'co-host'] }
    }
  });
  if (hostOrCoHost.length === 0) {
    res.status(403); // 403 Not Authorized: User must be host/co-host to edit event attendance
    return res.json({ message: `Forbidden: To edit attendance, user must be an organizer or co-host of the group holding the event.` });
  };

  const attendance = await Attendance.findOne({
    where: { eventId: eventId, userId: userId }
  });
  if (!attendance) {
    res.status(404); // 404 Error: Attendance does not exist
    return res.json({ message: `Attendance between the user and the event does not exist` });
  };

  if (attendance.status === 'attending' && status === 'pending') {
    res.status(400); // 400 Error: Cannot change status from "attending" to "pending"
    return res.json({ message: `Cannot change status from 'attending' to 'pending'` });
  };

  if (hostOrCoHost.length > 0) {
    attendance.userId = userId;
    attendance.status = status;
    await attendance.save();

    const updatedAttendance = await Attendance.findOne({
      where: { userId: userId, status: status }
    });

    const attandanceObj = {
      id: updatedAttendance.id,
      eventId,
      userId,
      status
    };

    res.status(200);
    return res.json(attandanceObj);

  } else {
    res.status(403);
    return res.json({ message: `Forbidden: Attendance can only be updated by a host or co-host of the group putting on the event` });
  };
});


// Edit an Event specified by its id (PUT /api/events/:eventId)
router.put('/:eventId', requireAuth, validateEvent, async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401);
    return res.json({ message: `Authentication Required. No user is currently logged in.` });
  };

  const userId = user.dataValues.id;
  const eventId = req.params.eventId;
  const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

  const event = await Event.findByPk(eventId, { include: [{ model: Group }, { model: Venue },] });
  if (!event) {
    res.status(404);
    return res.json({ message: `Event couldn't be found` });
  };

  const venue = event.Venue;
  if (!venue) {
    res.status(400);
    return res.json({ message: `Venue does not exist` });
  };

  const groupId = event.Group.id;
  const hostOrCoHost = await Membership.findAll({
    where: {
      userId: userId,
      groupId: groupId,
      status: { [Op.in]: ['host', 'co-host'] }
    }
  });

  if (hostOrCoHost.length === 0) {
    res.status(403); // 403 Not Authorized: User must be group organizer or co-host to create an event
    return res.json({ message: `Forbidden: User must be group organizer or co-host to edit an event` });
  };

  event.venueId = venueId;
  event.name = name;
  event.type = type;
  event.capacity = capacity;
  event.price = price;
  event.description = description;
  event.startDate = startDate;
  event.endDate = endDate;
  await event.save();

  const eventObj = {
    id: event.id,
    groupId: event.groupId,
    venueId: event.venueId,
    name: event.name,
    type: event.type,
    capacity: event.capacity,
    price: event.price,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
  };
  res.status(200);
  return res.json(eventObj);
});


// Get details of an Event specified by its id (GET /api/events/:eventId)
router.get('/:eventId', async (req, res) => {
  const eventId = req.params.eventId;

  const event = await Event.findByPk(eventId,
    {
      include: [
        { model: Attendance },
        { model: Group }, // include group images
        { model: Venue },
        { model: EventImage },
      ]
    }
  );

  // Error response: Couldn't find a Event with the specified id
  if (!event) {
    res.status(404);
    return res.json({ message: `Event couldn't be found` });
  };

  // convert to JSON
  // event = eventOrig.toJSON();

  // get totalAttending/numAttending
  let totalAttending;
  const attendancesArr = event.Attendances;
  totalAttending = attendancesArr.length;

  // get group
  const group = event.Group;
  const groupObj = {
    id: group.id,
    name: group.name,
    privacy: group.privacy,
    city: group.city,
    state: group.state,
    groupPreviewImage: group.previewImage, // added 2023-08-04
  };

  // get venue
  const venue = event.Venue;
  let venueVal;
  if (!venue) {
    venueVal = null;
  };
  if (venue) {
    venueVal = {
      id: venue.id,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      lat: venue.lat,
      lng: venue.lng
    }
  };

  // get event images
  let eventImagesArr = [];
  const eventImages = event.EventImages;
  eventImages.forEach(image => {
    const imageObj = {};
    imageObj.id = image.id;
    imageObj.url = image.url;
    imageObj.preview = image.preview;

    eventImagesArr.push(imageObj);
  });

  const eventObj = {
    id: event.id,
    groupId: event.groupId,
    venueId: event.venueId,
    name: event.name,
    description: event.description,
    type: event.type,
    capacity: event.capacity,
    price: event.price,
    startDate: event.startDate,
    endDate: event.endDate,
    numAttending: totalAttending,
    Group: groupObj,
    Venue: venueVal,
    EventImages: eventImagesArr
  };
  res.status(200);
  return res.json(eventObj);
});


// page and size validator
const validatePageAndSize = [
  check('page')
    .custom(async value => {
      if (value < 0) {
        throw new Error();
      }
    })
    .withMessage(`Page must be greater than or equal to 1`),
  check('size')
    .custom(async value => {
      if (value < 0) {
        throw new Error();
      }
    })
    .withMessage(`Size must be greater than or equal to 1`),
  handleValidationErrors
];


// Get all Events (GET /api/events)
router.get('/', validatePageAndSize, async (req, res) => {
  let allEventsObj = { Events: [] };

  let { page, size } = req.query;
  page = parseInt(page);
  size = parseInt(size);

  if (!page || Number.isNaN(page) || page === 0 || page > 10) page = 1;
  if (!size || Number.isNaN(size) || size === 0 || size > 20) size = 20;

  // eventsOrig is arr of Event objs; ideally list events by startDate DESC (larger/more recent --> smaller/less recent)
  const eventsOrig = await Event.findAll({
    // order: [['startDate', 'DESC']], // order clause wasn't working, prob because startDate is stored as date obj in DB?
    include: [
      { model: Attendance },
      { model: EventImage },
      { model: Group },
      { model: Venue }
    ],
    offset: (page - 1) * size,
    limit: size,
  });

  // convert to JSON
  let events = [];
  eventsOrig.forEach(event => {
    events.push(event.toJSON());
  });

  events.forEach(event => {
    // 1. forEach: create + add numAttending
    const attendancesArr = event.Attendances;
    event.numAttending = attendancesArr.length;
    delete event.Attendances;

    // 2. forEach: create + add previewImage
    event.EventImages.forEach(image => {
      if (image.preview === true) {
        event.previewImage = image.url;
      };
    });
    if (!event.previewImage) {
      event.previewImage = 'No preview image found';
    };
    delete event.EventImages;
    delete event.description;
    delete event.capacity;
    delete event.price;

    // get group
    const group = event.Group;

    // get venue
    const venue = event.Venue;
    let venueVal;

    if (!venue) {
      venueVal = null;
    };

    if (venue) {
      venueVal = {
        id: venue.id,
        city: venue.city,
        state: venue.state
      }
    };

    event.Group = {
      id: group.id,
      name: group.name,
      city: group.city,
      state: group.state
    };

    event.Venue = venueVal;

    // 3. forEach: add event to allEventsObj
    allEventsObj.Events.push(event);
  });

  return res.json(allEventsObj);
});


module.exports = router;
