const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const statusBook = app.db.define("statusBook", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idBook: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        status: {
            type: DataTypes.STRING,
        },
        comment: {
            type: DataTypes.TEXT('long'),
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
    });
    return statusBook;
};
