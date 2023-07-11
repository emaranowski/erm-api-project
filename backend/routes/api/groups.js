// resources for route paths beginning in: /api/groups

const express = require('express');
const { Group } = require('../../db/models');

const router = express.Router();

// GET ALL GROUPS (GET /api/groups)
router.get('/', async (req, res) => {

    const groups = await Group.findAll();

    return res.json(groups);

});

module.exports = router;
