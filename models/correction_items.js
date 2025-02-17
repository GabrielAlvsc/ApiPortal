const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const correction_items = app.db.define("correction_items", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        revision: {
            type: DataTypes.TEXT('long'),
        },
        ajusted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        response_item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
    });
    return correction_items;
};
