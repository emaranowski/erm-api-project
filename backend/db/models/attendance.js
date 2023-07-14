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
        models.Event, // DO NOT add for belongsTo: onDelete: 'CASCADE', hooks: true
        { foreignKey: 'eventId' } // but seems fine to keep below for .init()
      );

      // one user hasMany attendances
      // one attendance belongsTo one user
      Attendance.belongsTo(
        models.User, // DO NOT add for belongsTo: onDelete: 'CASCADE', hooks: true
        { foreignKey: 'userId' } // but seems fine to keep below for .init()
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
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('attending', 'pending'),
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
