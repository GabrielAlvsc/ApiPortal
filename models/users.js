const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (app) => {
  const users = app.db.define("users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value){
        const salt = bcrypt.genSaltSync()
        const password = bcrypt.hashSync(value, salt)
        this.setDataValue('password', password)
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    change_password: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });
  return users;
};