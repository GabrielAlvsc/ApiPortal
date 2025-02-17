const {DataTypes} = require("sequelize")

module.exports = (app) => {
    const logPdf = app.db.define("logPdf", {
        id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
        user_id: {
            type: DataTypes.INTEGER
        },
        model_id: {
            type: DataTypes.INTEGER
        },
        version_id: {
            type: DataTypes.INTEGER
        },
        book_id: {
            type: DataTypes.INTEGER
        },
        viewed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        user_ip: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    })

    return logPdf;
}