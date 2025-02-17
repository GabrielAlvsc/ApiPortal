const { DataTypes } = require("sequelize");

module.exports = (app) => {
  const equipaments = app.db.define("equipaments", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    vendor: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    endofsales: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        notEmpty: true,
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    }, sap: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
      
    }

  });
  return equipaments;
};
