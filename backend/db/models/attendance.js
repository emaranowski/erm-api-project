'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      // one event hasMany attendances
      // one attendance belongsTo one event
      Attendance.belongsTo(
        models.Event,
        { foreignKey: 'eventId' }
      );

      // one user hasMany attendances
      // one attendance belongsTo one user
      Attendance.belongsTo(
        models.User,
        { foreignKey: 'userId' }
      );

      // ?
      // many-to-many: events-to-users, via attendances?
      // one event belongsToMany users
      // one user belongsToMany events

    }
  }
  Attendance.init({
    id: { // added to init(), since there aare multiple FKs; want PK to be 'id'
      type: DataTypes.INTEGER, // do not want auto-assigned PK based on combo of FK col names
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('yes', 'no', 'maybe'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Attendance',
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    }
  });
  return Attendance;
};
