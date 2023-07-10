'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  };

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 30],
          // isAlpha: true,
          isNotAlpha(value) {
            if (!Validator.isAlpha(value)) {
              throw new Error(`Can only contain letters.`);
            }
          }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 60],
          // isAlpha: true,
          isNotAlpha(value) {
            if (!Validator.isAlpha(value)) {
              throw new Error(`Can only contain letters.`);
            }
          }
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
        unique: true,
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
