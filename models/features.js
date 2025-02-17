const { DataTypes } = require("sequelize");

module.exports = (app) => {
  const features = app.db.define("features", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    is_variable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    version_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
  });
  return features;
};
