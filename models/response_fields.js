const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const response_fields = app.db.define("response_fields", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        response: {
            type: DataTypes.TEXT('long'),
        },
        field_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        response_item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        }
    });
    return response_fields;
};
