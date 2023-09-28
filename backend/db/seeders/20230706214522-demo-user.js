'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        firstName: 'FirstNameOne',
        lastName: 'LastNameOne',
        email: 'demo1@demo.com',
        username: 'DemoUser1',
        hashedPassword: bcrypt.hashSync('password1')
      },
      {
        firstName: 'FirstNameTwo',
        lastName: 'LastNameTwo',
        email: 'demo2@demo.com',
        username: 'DemoUser2',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        firstName: 'FirstNameThree',
        lastName: 'LastNameThree',
        email: 'demo3@demo.com',
        username: 'DemoUser3',
        hashedPassword: bcrypt.hashSync('password3')
      },
      { // added DemoUser4
        firstName: 'FirstNameFour',
        lastName: 'LastNameFour',
        email: 'demo4@demo.com',
        username: 'DemoUser4',
        hashedPassword: bcrypt.hashSync('password4')
      },
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: {
        [Op.in]: ['DemoUser1', 'DemoUser2', 'DemoUser3', 'DemoUser4'] // added DemoUser4
      }
    }, {});
  }
};
