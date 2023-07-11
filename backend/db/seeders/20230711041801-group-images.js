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
        url: 'https://camo.githubusercontent.com/74298045adbb7ccc54a28b099ac6a06911ec85b44432f41ea461357da3dc2204/68747470733a2f2f61707061636164656d792d6f70656e2d6173736574732e73332e75732d776573742d312e616d617a6f6e6177732e636f6d2f4d6f64756c61722d437572726963756c756d2f636f6e74656e742f7765656b2d31322f6d65657475702d64622d736368656d612e706e67',
        preview: false
      },
      {
        groupId: 2,
        url: 'https://camo.githubusercontent.com/74298045adbb7ccc54a28b099ac6a06911ec85b44432f41ea461357da3dc2204/68747470733a2f2f61707061636164656d792d6f70656e2d6173736574732e73332e75732d776573742d312e616d617a6f6e6177732e636f6d2f4d6f64756c61722d437572726963756c756d2f636f6e74656e742f7765656b2d31322f6d65657475702d64622d736368656d612e706e67',
        preview: false
      },
      {
        groupId: 3,
        url: 'https://camo.githubusercontent.com/74298045adbb7ccc54a28b099ac6a06911ec85b44432f41ea461357da3dc2204/68747470733a2f2f61707061636164656d792d6f70656e2d6173736574732e73332e75732d776573742d312e616d617a6f6e6177732e636f6d2f4d6f64756c61722d437572726963756c756d2f636f6e74656e742f7765656b2d31322f6d65657475702d64622d736368656d612e706e67',
        preview: false
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: [
          'https://camo.githubusercontent.com/74298045adbb7ccc54a28b099ac6a06911ec85b44432f41ea461357da3dc2204/68747470733a2f2f61707061636164656d792d6f70656e2d6173736574732e73332e75732d776573742d312e616d617a6f6e6177732e636f6d2f4d6f64756c61722d437572726963756c756d2f636f6e74656e742f7765656b2d31322f6d65657475702d64622d736368656d612e706e67',
        ]
      } // if more urls added in up, add in down too
    }, {});

  }
};
