const { DataTypes } = require("sequelize");

module.exports = (app) => {
    const images = app.db.define("images", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        hash:{
            type:DataTypes.TEXT
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        path: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        item_id: {
            type: DataTypes.INTEGER
        },
        response_field_id: {
            type: DataTypes.INTEGER
        },
        equipments_id:{
            type: DataTypes.INTEGER
        }
    });
    return images;  // Henrique esteve por aqui
};
