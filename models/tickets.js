const { DataTypes } = require("sequelize");

module.exports = (app) => {
  const tickets = app.db.define("tickets", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_requester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    user_responsible: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            notEmpty: false,
        },
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            notEmpty: false,
        },
    },
    finished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notEmpty: true,
        },
      },
  });
  return tickets;
};