const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const fields = app.db.define("fields", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title_field: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        standard_value: {
            type: DataTypes.TEXT('long'),
        },
        order_field: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        type_field_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        feature_id: {
            type: DataTypes.INTEGER,
        },
    });
    return fields;
};
