'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {

      // one user/organizer hasMany groups
      // one group belongsTo one user/organizer
      User.hasMany(
        models.Group,
        { foreignKey: 'organizerId' } // may need to alias? like.. { foreignKey: 'currentTeamId', as: 'TeamRoster' }
      );

      // one membership belongsTo one user
      // one user hasMany memberships
      User.hasMany(
        models.Membership,
        { foreignKey: 'userId' }
      );

      // one user hasMany attendances
      // one attendance belongsTo one user
      User.hasMany(
        models.Attendance,
        { foreignKey: 'userId' }
      );

      // one user belongsToMany groups ?
      // one group belongsToMany users ?
      User.belongsToMany(
        models.Group,
        {
          through: models.Membership,
          foreignKey: 'userId',
          otherKey: 'groupId'
        }
      );

      // BUG HERE when both commented in
      // ?
      // many-to-many: events-to-users, via attendances?
      // one event belongsToMany users
      // one user belongsToMany events
      // User.belongsToMany(
      //   models.Event,
      //   {
      //     through: models.Attendance,
      //     foreignKey: 'userId',
      //     otherKey: 'eventId'
      //   }
      // );

    }
  };

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 30]
          // isAlpha: true,
          // isNotAlpha(value) {
          //   if (!Validator.isAlpha(value)) {
          //     throw new Error(`Can only contain letters.`);
          //   }
          // }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 60]
          // isAlpha: true,
          // isNotAlpha(value) {
          //   if (!Validator.isAlpha(value)) {
          //     throw new Error(`Can only contain letters.`);
          //   }
          // }
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
        unique: {
          msg: 'User with that username already exists'
        },
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error(`Cannot be an email.`);
            }
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
        unique: {
          msg: 'User with that email already exists'
        },
        validate: {
          len: [3, 256],
          isEmail: true
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      }
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: { // prevent sensitive info from being sent to frontend
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt']
        } // exclude from default query when searching for Users
      }
    }
  );
  return User;
};
