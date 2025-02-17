const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const items = app.db.define("items", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        fillable: {
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
        mandatory: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_subitem: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        father_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    });

    return items;
};
