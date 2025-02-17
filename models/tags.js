const { DataTypes } = require("sequelize");

module.exports = (app) => {
  const tags = app.db.define("tags", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
       name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      associated_categories: {
        type: DataTypes.STRING,
        allowNull: true,
      },
  });
  return tags;
}