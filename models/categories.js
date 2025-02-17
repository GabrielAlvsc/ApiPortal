const { DataTypes } = require("sequelize");

module.exports = (app) => {
  const categories = app.db.define("categories", {
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
  });
  return categories;
};
