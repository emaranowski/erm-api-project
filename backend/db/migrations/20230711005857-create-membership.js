// UPDATED:

'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema in options obj
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    options.tableName = 'Memberships';
    await queryInterface.createTable(options, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // table name, so plural; only add refs on mig
          key: 'id'
        }
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Groups', // table name, so plural; only add refs on mig
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('host', 'co-host', 'member', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      // status: {
      //   type: Sequelize.ENUM('pending', 'rejected', 'approved'),
      //   allowNull: true,
      //   // defaultValue: 'pending'
      // },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

  },
  async down(queryInterface, Sequelize) {

    options.tableName = 'Memberships';
    await queryInterface.dropTable(options);

  }
};

// ORIG:

// 'use strict';

// let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA; // define schema in options obj
// }

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {

//     options.tableName = 'Memberships';
//     await queryInterface.createTable(options, {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER
//       },
//       userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'Users', // table name, so plural; only add refs on mig
//           key: 'id'
//         }
//       },
//       groupId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: 'Groups', // table name, so plural; only add refs on mig
//           key: 'id'
//         }
//       },
//       status: {
//         type: Sequelize.ENUM('pending', 'rejected', 'approved'),
//         allowNull: true
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
//       }
//     });

//   },
//   async down(queryInterface, Sequelize) {

//     options.tableName = 'Memberships';
//     await queryInterface.dropTable(options);

//   }
// };
