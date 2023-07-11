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
        url: 'https://tinyurl.com/meetup-schema',
        preview: false
      },
      {
        eventId: 2,
        url: 'https://tinyurl.com/meetup-schema',
        preview: false
      },
      {
        eventId: 3,
        url: 'https://tinyurl.com/meetup-schema',
        preview: false
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: [
          'https://tinyurl.com/meetup-schema',
        ]
      } // if more urls added in up, add in down too
    }, {});

  }
};
