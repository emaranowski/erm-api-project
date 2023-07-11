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
      // Group.belongsTo(
      //   models.User,
      //   { foreignKey: 'organizerId' } // may need to alias? like.. { foreignKey: 'currentTeamId', as: 'TeamRoster' }
      // );

    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER, // add ref to organizerId/userId in migration, not model
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('outdoors', 'food', 'board games'),
      allowNull: true,
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
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });
  return Group;
};