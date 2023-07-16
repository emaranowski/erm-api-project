// UPDATED:

'use strict';

const { Event } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await Event.bulkCreate([
      {
        venueId: 1,
        groupId: 1,
        name: 'Forest Park Hike',
        description: 'A shady hike through Forest Park.',
        type: 'In person',
        capacity: 100,
        price: 5,
        startDate: '2024-08-12 09:00:00',
        endDate: '2024-08-12 11:00:00'
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'First Sunday Potluck',
        description: 'A cozy potluck. Bring your best culinary inventions!',
        type: 'In person',
        capacity: 15,
        price: 5.75,
        startDate: '2024-08-06 12:00:00',
        endDate: '2024-08-06 14:00:00'
      },
      {
        venueId: null, // changed from 3 to null
        groupId: 3,
        name: 'Mox Board Game Night',
        description: 'Wednesday night board games at Mox Boarding House.',
        type: 'Online',
        capacity: 30,
        price: 0,
        startDate: '2024-08-23 14:00:00',
        endDate: '2024-08-23 16:00:00'
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'Events';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      // name: {
      //   [Op.in]: ['Forest Park Hike',
      //     'First Sunday Potluck',
      //     'Mox Board Game Night',
      //     'Tennis Group First Meet and Greet']
      // },
      groupId: { [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
    }, {});

  }
};


// ORIG:

// 'use strict';

// const { Event } = require('../models');
// const bcrypt = require('bcryptjs');

// let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA; // define schema in options obj
// }

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {

//     await Event.bulkCreate([
//       {
//         venueId: 1,
//         groupId: 1,
//         name: 'Forest Park Hike',
//         description: 'A shady hike through Forest Park.',
//         type: 'outdoors',
//         capacity: 100,
//         price: 0,
//         startDate: '2023-08-12',
//         endDate: '2023-08-12'
//       },
//       {
//         venueId: 2,
//         groupId: 2,
//         name: 'First Sunday Potluck',
//         description: 'A cozy potluck. Bring your best culinary inventions!',
//         type: 'indoors',
//         capacity: 15,
//         price: 5,
//         startDate: '2023-08-06',
//         endDate: '2023-08-06'
//       },
//       {
//         venueId: 3,
//         groupId: 3,
//         name: 'Mox Board Game Night',
//         description: 'Wednesday night board games at Mox Boarding House.',
//         type: 'indoors',
//         capacity: 30,
//         price: 0,
//         startDate: '2023-08-23',
//         endDate: '2023-08-23'
//       },
//     ], { validate: true });

//   },

//   async down(queryInterface, Sequelize) {

//     options.tableName = 'Events';
//     const Op = Sequelize.Op;
//     return queryInterface.bulkDelete(options, {
//       name: {
//         [Op.in]: ['Forest Park Hike', 'First Sunday Potluck', 'Mox Board Game Night']
//       }
//     }, {});

//   }
// };
