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
        { foreignKey: 'eventId' }
      );

      // one event hasMany attendances
      // one attendance belongsTo one event
      Event.hasMany(
        models.Attendance,
        { foreignKey: 'eventId' }
      );

      // one venue hasMany events
      // one event belongsTo one venue
      Event.belongsTo(
        models.Venue,
        { foreignKey: 'venueId' }
      );

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
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.ENUM('indoors', 'outdoors'),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
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