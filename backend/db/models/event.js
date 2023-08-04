// UPDATED:

'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      // one event hasMany eventimages
      // one eventimage belongsTo one event
      Event.hasMany(
        models.EventImage,
        { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true }
      );

      // one event hasMany attendances
      // one attendance belongsTo one event
      Event.hasMany(
        models.Attendance,
        { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true }
      );

      // one venue hasMany events
      // one event belongsTo one venue
      Event.belongsTo(
        models.Venue,
        { foreignKey: 'venueId' }
      ); // could be SET NULL?

      // one group hasMany events
      // one event belongsTo one group
      Event.belongsTo(
        models.Group,
        { foreignKey: 'groupId' }
      );

      // BUG HERE when both commented in
      // ?
      // many-to-many: events-to-users, via attendances?
      // one event belongsToMany users
      // one user belongsToMany events
      // Event.belongsToMany(
      //   models.User,
      //   {
      //     through: models.Attendance,
      //     foreignKey: 'eventId',
      //     otherKey: 'userId'
      //   }
      // );

      // many to many: venues-to-groups, via events

    }
  }
  Event.init({
    id: { // added to init(), since there aare multiple FKs; want PK to be 'id'
      type: DataTypes.INTEGER, // do not want auto-assigned PK based on combo of FK col names
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: true, // changed to true
      onDelete: 'CASCADE'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Online', 'In person'), // updated vals
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL, // changed from INT to DEC
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      // validate: { // commented out 2023-08-04 -- TO ALLOW SEED DATA IN THE PAST
      //   // Date.parse(): converts "2011-10-10T14:48:00.000+09:00" (date-time form, w/ ms & time zone)
      //   // into ms since 1 Jan 1970 00:00:00 UTC
      //   // Date.now(): rets ms since 1 Jan 1970 00:00:00 UTC
      //   isAfterCurrentDateTime(value) { // ORIG BEFORE 2023-08-04
      //     if (Date.parse(value) <= Date.now()) {
      //       throw new Error(`Start date must be in the future`);
      //     }
      //   }
      // }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        // isAfterCurrentDateTime(value) {
        //   if (parseInt(value) <= parseInt(this.startDate)) {
        //     throw new Error('End date must be after start date');
        //   }
        // }
        isAfterStartDateTime(value) { // ORIG BEFORE 2023-08-04
          if (Date.parse(value) <= Date.parse(this.startDate)) {
            throw new Error(`End date must be after start date`);
          }
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Event',
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });
  return Event;
};


// ORIG:

// 'use strict';

// const { Model, Validator } = require('sequelize');

// module.exports = (sequelize, DataTypes) => {
//   class Event extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {

//       // one event hasMany eventimages
//       // one eventimage belongsTo one event
//       Event.hasMany(
//         models.EventImage,
//         { foreignKey: 'eventId' }
//       );

//       // one event hasMany attendances
//       // one attendance belongsTo one event
//       Event.hasMany(
//         models.Attendance,
//         { foreignKey: 'eventId' }
//       );

//       // one venue hasMany events
//       // one event belongsTo one venue
//       Event.belongsTo(
//         models.Venue,
//         { foreignKey: 'venueId' }
//       );

//       // one group hasMany events
//       // one event belongsTo one group
//       Event.belongsTo(
//         models.Group,
//         { foreignKey: 'groupId' }
//       );

//       // BUG HERE when both commented in
//       // ?
//       // many-to-many: events-to-users, via attendances?
//       // one event belongsToMany users
//       // one user belongsToMany events
//       // Event.belongsToMany(
//       //   models.User,
//       //   {
//       //     through: models.Attendance,
//       //     foreignKey: 'eventId',
//       //     otherKey: 'userId'
//       //   }
//       // );

//       // many to many: venues-to-groups, via events

//     }
//   }
//   Event.init({
//     id: { // added to init(), since there aare multiple FKs; want PK to be 'id'
//       type: DataTypes.INTEGER, // do not want auto-assigned PK based on combo of FK col names
//       allowNull: false,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     venueId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     groupId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     type: {
//       type: DataTypes.ENUM('indoors', 'outdoors'),
//       allowNull: false,
//     },
//     capacity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     price: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     startDate: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     endDate: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//   }, {
//     sequelize,
//     modelName: 'Event',
//     defaultScope: {
//       attributes: {
//         exclude: ['createdAt', 'updatedAt']
//       }
//     }
//   });
//   return Event;
// };
