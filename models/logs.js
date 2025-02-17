const {DataTypes} = require("sequelize")

module.exports = (app) => {
    const logs = app.db.define("logs", {
		id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
			  notEmpty: true,
			},
        },
		user_executor_id: {
			type: DataTypes.INTEGER
		},
		equipment_id:{
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
        item_id: {
            type: DataTypes.INTEGER
        },
		
		field_id: {
            type: DataTypes.INTEGER
        },
		
        feature_id: {
            type: DataTypes.INTEGER
        },
		response_item_id: {
			type: DataTypes.INTEGER
		},
		
		response_feature_id: {
			type: DataTypes.INTEGER
		},

		log_pdf_id: {
			type: DataTypes.INTEGER
		},
		action:{
			type: DataTypes.STRING
		},
		message:{
			type: DataTypes.STRING
		},
    })
    return logs;
}