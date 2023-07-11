'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      // one membership belongsTo one user
      // one user hasMany memberships
      Membership.belongsTo(
        models.User,
        { foreignKey: 'userId' }
      );

      // one membership belongsTo one group
      // one group hasMany memberships
      Membership.belongsTo(
        models.Group,
        { foreignKey: 'groupId' }
      );

    }
  }
  Membership.init({
    id: { // added to init(), since there aare multiple FKs; want PK to be 'id'
      type: DataTypes.INTEGER, // do not want auto-assigned PK based on combo of FK col names
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'rejected', 'approved'),
      allowNull: true, // maybe change later to defaultValue?
    }
  }, {
    sequelize,
    modelName: 'Membership',
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });
  return Membership;
};
