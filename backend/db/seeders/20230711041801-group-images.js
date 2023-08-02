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
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Mount_Hancock_NH_June_2019.jpg/544px-Mount_Hancock_NH_June_2019.jpg',
        preview: true
      },
      {
        groupId: 2,
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/600px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
        preview: true
      },
      {
        groupId: 3,
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Pottery_game_players.JPG',
        preview: true
      },
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      // url: {
      //   [Op.in]: [
      //     'https://tinyurl.com/meetup-schema', // URL used until 2023-08-01
      //   ]
      // } // if more urls added in up, add in down too
      // groupId: {
      //   [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      // } // added to accomodate later tests, used until 2023-08-01
      preview: {
        [Op.in]: [true, false]
      } // added 2023-08-02
    }, {});

  }
};
