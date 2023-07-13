'use strict';

const { EventImage } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await EventImage.bulkCreate([
      {
        eventId: 1,
        url: 'https://event1.com/event-image-1.png',
        preview: true
      },
      {
        eventId: 2,
        url: 'https://event2.com/event-image-2.png',
        preview: true
      },
      {
        eventId: 3,
        url: 'https://event3.com/event-image-3.png',
        preview: true
      }
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      // url: {
      //   [Op.in]: [
      //     'https://tinyurl.com/meetup-schema'
      //   ]
      // } // if more urls added in up, add in down too
      eventId: {
        [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      } // added to accomodate later tests
    }, {});

  }
};
