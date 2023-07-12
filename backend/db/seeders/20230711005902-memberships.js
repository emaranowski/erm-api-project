// UPDATED:

'use strict';

const { Membership } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await Membership.bulkCreate([
      {
        userId: 1,
        groupId: 1,
        status: 'host' // i.e. organizer
      },
      {
        userId: 1, // added to test, so that User 1 is in 2 groups, as host & member (for: GET /api/groups/current)
        groupId: 2,
        status: 'member' // i.e. organizer
      },
      {
        userId: 2,
        groupId: 1,
        status: 'co-host'
      },
      {
        userId: 3,
        groupId: 2,
        status: 'member'
      },
      {
        userId: 4,
        groupId: 3,
        status: 'pending'
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'Memberships';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: {
        [Op.in]: [1, 2, 3, 4] // added 4
      } // may need to add combos of userId & groupId?
    }, {});

  }
};


// ORIG:

// 'use strict';

// const { Membership } = require('../models');
// const bcrypt = require('bcryptjs');

// let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA; // define schema in options obj
// }

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {

//     await Membership.bulkCreate([
//       {
//         userId: 1,
//         groupId: 1,
//         status: 'pending'
//       },
//       {
//         userId: 2,
//         groupId: 2,
//         status: 'rejected'
//       },
//       {
//         userId: 3,
//         groupId: 3,
//         status: 'approved'
//       },
//     ], { validate: true });

//   },

//   async down(queryInterface, Sequelize) {

//     options.tableName = 'Memberships';
//     const Op = Sequelize.Op;
//     return queryInterface.bulkDelete(options, {
//       userId: {
//         [Op.in]: [1, 2, 3] // added 4
//       } // may need to add combos of userId & groupId?
//     }, {});

//   }
// };
