const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const tag_associations = app.db.define("tag_associations", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        equipament_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validade: {
                notEmpty: true,
            }
        },
        tag_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validade: {
                notEmpty: true,

            },
        }

    });
    return tag_associations;
};