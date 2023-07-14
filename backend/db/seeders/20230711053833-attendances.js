'use strict';

const { Attendance } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await Attendance.bulkCreate([
      {
        eventId: 1,
        userId: 1,
        status: 'attending'
      },
      {
        eventId: 1,
        userId: 2,
        status: 'attending'
      },
      {
        eventId: 1,
        userId: 3,
        status: 'attending'
      },
      {
        eventId: 1,
        userId: 4,
        status: 'pending'
      },
      {
        eventId: 2,
        userId: 1,
        status: 'attending'
      },
      {
        eventId: 2,
        userId: 2,
        status: 'attending'
      },
      {
        eventId: 3,
        userId: 1,
        status: 'pending'
      },
      {
        eventId: 3,
        userId: 2,
        status: 'attending'
      },
      {
        eventId: 3,
        userId: 3,
        status: 'pending'
      },
      {
        eventId: 3,
        userId: 4,
        status: 'attending'
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'Attendances';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      status: {
        [Op.in]: ['attending', 'pending']
      } // ideally use something better than status
    }, {});

  }
};
