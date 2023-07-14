// UPDATED:

'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      // one user/organizer hasMany groups
      // one group belongsTo one user/organizer
      Group.belongsTo(
        models.User,
        { foreignKey: 'organizerId' } // may need to alias? like.. { foreignKey: 'currentTeamId', as: 'TeamRoster' }
      ); // , onDelete: 'CASCADE', hooks: true // figure out how to on del cascade w/ alias

      // one membership belongsTo one group
      // one group hasMany memberships
      Group.hasMany(
        models.Membership,
        { foreignKey: 'groupId' }
      );

      // one group hasMany venues
      // one venue belongsTo one group
      Group.hasMany(
        models.Venue,
        { foreignKey: 'groupId' }
      );

      // one groupimage belongsTo one group
      // one group hasMany groupimages
      Group.hasMany(
        models.GroupImage,
        { foreignKey: 'groupId' }
      );

      // one group hasMany events
      // one event belongsTo one group
      Group.hasMany(
        models.Event,
        { foreignKey: 'groupId' }
      );

      // one user belongsToMany groups ?
      // one group belongsToMany users ?
      Group.belongsToMany(
        models.User,
        {
          through: models.Membership,
          foreignKey: 'groupId',
          otherKey: 'userId' // , onDelete: 'CASCADE', hooks: true
        }
      );

      // ?
      // many to many: venues-to-groups, via events
      // one venue belongsToMany groups
      // one group belongsToMany venues
      Group.belongsToMany(
        models.Venue,
        {
          through: models.Event,
          foreignKey: 'groupId',
          otherKey: 'venueId'
        }
      );

    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER, // add ref to organizerId/userId in migration, not model
      allowNull: false,
      // onDelete: 'CASCADE' // figure out how to add w/ alias
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Online', 'In person'), // updated vals
      allowNull: false,
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Group',
    // defaultScope: { // removed this dscope
    //   attributes: { // so createdAt & updatedAt show in Get All Groups
    //     exclude: ['createdAt', 'updatedAt']
    //   }
    // }
  });
  return Group;
};


// ORIG:

// 'use strict';

// const { Model, Validator } = require('sequelize');

// module.exports = (sequelize, DataTypes) => {
//   class Group extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {

//       // one user/organizer hasMany groups
//       // one group belongsTo one user/organizer
//       Group.belongsTo(
//         models.User,
//         { foreignKey: 'organizerId' } // may need to alias? like.. { foreignKey: 'currentTeamId', as: 'TeamRoster' }
//       );

//       // one membership belongsTo one group
//       // one group hasMany memberships
//       Group.hasMany(
//         models.Membership,
//         { foreignKey: 'groupId' }
//       );

//       // one group hasMany venues
//       // one venue belongsTo one group
//       Group.hasMany(
//         models.Venue,
//         { foreignKey: 'groupId' }
//       );

//       // one groupimage belongsTo one group
//       // one group hasMany groupimages
//       Group.hasMany(
//         models.GroupImage,
//         { foreignKey: 'groupId' }
//       );

//       // one group hasMany events
//       // one event belongsTo one group
//       Group.hasMany(
//         models.Event,
//         { foreignKey: 'groupId' }
//       );

//       // one user belongsToMany groups ?
//       // one group belongsToMany users ?
//       Group.belongsToMany(
//         models.User,
//         {
//           through: models.Membership,
//           foreignKey: 'groupId',
//           otherKey: 'userId'
//         }
//       );

//       // ?
//       // many to many: venues-to-groups, via events
//       // one venue belongsToMany groups
//       // one group belongsToMany venues
//       Group.belongsToMany(
//         models.Venue,
//         {
//           through: models.Event,
//           foreignKey: 'groupId',
//           otherKey: 'venueId'
//         }
//       );

//     }
//   }
//   Group.init({
//     organizerId: {
//       type: DataTypes.INTEGER, // add ref to organizerId/userId in migration, not model
//       allowNull: false,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true
//     },
//     about: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     type: {
//       type: DataTypes.ENUM('outdoors', 'food', 'board games'),
//       allowNull: false,
//     },
//     private: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//     },
//     city: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     state: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     }
//   }, {
//     sequelize,
//     modelName: 'Group',
//     // defaultScope: { // removed this dscope
//     //   attributes: { // so createdAt & updatedAt show in Get All Groups
//     //     exclude: ['createdAt', 'updatedAt']
//     //   }
//     // }
//   });
//   return Group;
// };
