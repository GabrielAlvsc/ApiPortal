const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const response_features = app.db.define("response_features", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        response: {
            type: DataTypes.TEXT('long'),
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },

        feature_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        status: {
            type: DataTypes.STRING,
            allowNull:  false,
            defaultValue: 'Aguardando envio para revisão',
            validade: {
                notyEmpty: true,
            }
        }
    });
    return response_features;
};
