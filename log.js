module.exports = (app) => {
	const register = async (action, user_id, message, data = {}) => {
		const {
			equipment_id,
			model_id,
			version_id,
			book_id,
			item_id,
			feature_id,
			response_item_id,
			response_field_id,
			response_feature_id,
			correction_feature_id,
		} = data;
		console.log(action, user_id, message, data);

		await app.db.models.logs.create({
			action,
			user_id,
			message,
			equipment_id,
			model_id,
			version_id,
			book_id,
			item_id,
			feature_id,
			response_item_id,
			response_field_id,
			response_feature_id,
			correction_feature_id,
		});
	}
	const actions = {
		createBook: "Criar caderno",
		updateBook: "Alterar caderno",
		updateStatus: "Alterar status de caderno",

		createEquipment: "Criar equipamento",
		updateEquipment: "Atualizar equipamento",
		deleteEquipment: "Apagar equipamento",

		createFeature: "Criar feature",
		updateFeature: "Alterar feature",
		deleteFeature: "Excluir feature",

		createField: "Criar campo",
		updateField: "Alterar campo",
		deleteField: "Excluir campo",

		createItem: "Criar item",
		updateItem: "Alterar item",
		deleteItem: "Excluir item",

		createModel: "Criar Modelo",
		updateModel: "Alterar Modelo",

		generatePDF: "Gerar PDF",

		revisarTeste: "Revisar teste",
		revisarCaracteristica: "Revisar Feature",

		createNewVersion: "Criar nova versão",
		closeVersion: "Finalizar versão",

		finishBook: "Finalizar caderno",

		login: "Login no Sistema"
	}

	const checkChange = (origialObj, newObj) => {
		const changes = [];
		const keys = Object.keys(origialObj);
		for (const key of keys) {
			if (key in newObj && origialObj[key] !== newObj[key]) {
				changes.push(key);
			}
		}
		return changes;
	}
	return { actions, register, checkChange};
}