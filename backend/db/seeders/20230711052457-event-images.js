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
        url: 'https://res.cloudinary.com/dragonspell/images/w_800,h_480,dpr_auto,fl_progressive:steep,f_auto/w_800,h_480/v1623257541/www.travelportland.com/cropped-mktg-20192106-Forest-Park-0004-scaled-1/cropped-mktg-20192106-Forest-Park-0004-scaled-1.jpg',
        preview: true
      },
      {
        eventId: 2,
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Eat_Alberta_Potluck_%287072671637%29.jpg/640px-Eat_Alberta_Potluck_%287072671637%29.jpg',
        preview: true
      },
      {
        eventId: 3,
        url: 'https://cdn11.bigcommerce.com/s-7eepw5u9z2/product_images/uploaded_images/pdxdining1.jpg',
        preview: true
      }
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {

    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      // url: {
      //   [Op.in]: [
      //     'https://tinyurl.com/meetup-schema'
      //   ]
      // } // if more urls added in up, add in down too
      eventId: {
        [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      } // added to accomodate later tests
    }, {});

  }
};
