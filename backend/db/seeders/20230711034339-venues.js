'use strict';

const { Venue } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await Venue.bulkCreate([
      {
        groupId: 1,
        address: '1234 SE Cesar Chavez Blvd',
        city: 'Portland',
        state: 'OR',
        lat: 45.547859,
        lng: -122.672447
      },
      // {
      //   groupId: 1,
      //   address: 'SE Cesar Chavez Blvd & Stark St',
      //   city: 'Portland',
      //   state: 'OR',
      //   lat: 45.544759,
      //   lng: -122.672987
      // },
      {
        groupId: 2,
        address: '3456 N Dekum St',
        city: 'Portland',
        state: 'OR',
        lat: 45.587456,
        lng: -122.760002
      },
      {
        groupId: 3,
        address: '5678 N Killingsworth Ct',
        city: 'Portland',
        state: 'OR',
        lat: 45.572542,
        lng: -122.654024
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'Venues';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      address: {
        [Op.in]: ['1234 SE Cesar Chavez Blvd',
          // 'SE Cesar Chavez Blvd & Stark St',
          '3456 N Dekum St',
          '5678 N Killingsworth Ct']
      }
    }, {});

  }
};
