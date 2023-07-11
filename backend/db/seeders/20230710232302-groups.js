'use strict';

const { Group } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Group.bulkCreate([
      {
        organizerId: 1, // prob correct syntax for FK val
        name: 'Hikers',
        about: 'A group of hikers who love getting outdoors.',
        type: 'outdoors', // may not be correct ENUM syntax
        private: false,
        city: 'Portland',
        state: 'OR'
      },
      {
        organizerId: 2, // prob correct syntax for FK val
        name: 'Hobby Chefs',
        about: 'Culinary creatives who want to share and try new recipes together.',
        type: 'food', // may not be correct ENUM syntax
        private: true,
        city: 'Portland',
        state: 'OR'
      },
      {
        organizerId: 3, // prob correct syntax for FK val
        name: 'Board Game Fans',
        about: 'Folks who love playing and making board games.',
        type: 'board games', // may not be correct ENUM syntax
        private: false,
        city: 'Portland',
        state: 'OR'
      },
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: ['Hikers', 'Hobby Chefs', 'Board Game Fans']
      }
    }, {});
  }
};
