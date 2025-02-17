const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const response_items = app.db.define("response_items", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        comment: {
            type: DataTypes.TEXT('long'),
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        item_id: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Aguardando envio para revisão',
            validate: {
                notEmpty: true,
            }
        }
    });
    return response_items;
};
