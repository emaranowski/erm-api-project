// resources for route paths beginning in: /api/venues
const express = require('express');
const { Op } = require('sequelize');
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator'); // validates req.body
const { handleValidationErrors } = require('../../utils/validation'); // validates req.body
const router = express.Router();


module.exports = router;
