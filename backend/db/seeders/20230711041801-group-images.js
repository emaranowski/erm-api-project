'use strict';

const { GroupImage } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await GroupImage.bulkCreate([
      {
        groupId: 1,
        url: 'https://tinyurl.com/meetup-schema',
        preview: true
      },
      {
        groupId: 2,
        url: 'https://tinyurl.com/meetup-schema',
        preview: false
      },
      {
        groupId: 3,
        url: 'https://tinyurl.com/meetup-schema',
        preview: false
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      // url: {
      //   [Op.in]: [
      //     'https://tinyurl.com/meetup-schema',
      //   ]
      // } // if more urls added in up, add in down too
      groupId: {
        [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      } // added to accomodate later tests
    }, {});

  }
};
