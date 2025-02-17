const { Op } = require('sequelize');

module.exports = app => {

	app.post('/legacyFix', app.auth.cdt, async (req, res) => {
		try {
			let { version_id, features } = req.body;
			features = features.map(feature => feature.trim());
			features = [... new Set(features)];
			const version = await app.models.versions.findByPk(version_id, { raw: true });

			if (!version) {
				return res.status(400).json({ message: "Versão inexistente" });
			}
			const featuresExist = await app.models.features.findAll({
				raw: true,
				where: {
					version_id,
					name: { [Op.in]: features }
				}
			});
			features = features.filter(feature => {
				return !featuresExist.some(f => f.name === feature)
			})
			if (features.length === 0) {
				return res.status(200).json({ message: "Nenhuma alteração necessária" });
			}
			let lastFeature = await app.models.features.findOne({
				raw: true,
				where: {
					version_id,
				},
				order: [['order', 'DESC']]
			})
			lastFeature = lastFeature ? lastFeature.order : 0;
			// criar features
			for (const i in features) {
				features[i] = await app.models.features.create({
					name: features[i],
					version_id,
					order: lastFeature + 1,
					is_variable: false
				});
				lastFeature += 1
			}


			// pegar todos os cadernos dessa versão
			const books = await app.models.books.findAll({
				raw: true,
				where: {
					version_id
				}
			});
			for (const book of books) {
				for (const feature of features) {
					await app.models.response_features.create({
						response: '~',
						book_id: book.id,
						status: 'Aprovado',
						feature_id: feature.id,
					});
				}
			}

			return res.status(201).json({ message: "Alteração concluída" });
		} catch (error) {
			return res.status(400).json({ message: error.message })
		}
	})

	app.post('/legacyFill', app.auth.cdt, async (req, res) => {
		try {
			let { book_id, features } = req.body;
			const book = await app.models.books.findByPk(book_id);
			let feature_names = [... new Set(features.map(feature => feature.name))];

			if (feature_names.length !== features.length) {
				return res.status(400).json({ message: "Nomes de features duplicados" });
			}

			let features_version = await app.models.features.findAll({
				where: {
					version_id: book.version_id,
					name: { [Op.in]: feature_names },
				}
			});

			if (features_version.length !== features.length) {
				let unfind = features.filter(feature => !features_version.some(f => f.name === feature.name))
				return res.status(400).json({ message: `As caracteristicas ${unfind.map(feature => feature.name).join(', ')} não existem nesse caderno!` });
			}
			features_version = features_version.filter(feature => !feature.is_variable);

			if (features_version.length !== features.length) {
				let unfind = features.filter(feature => !features_version.some(f => f.name === feature.name))
				return res.status(400).json({ message: `As caracteristicas ${unfind.map(feature => feature.name).join(', ')} precisam de um teste!` });
			}
			const response_features = await app.models.response_features.findAll({
				where: {
					feature_id: { [Op.in]: features_version.map(feature => feature.id) },
					book_id: book_id
				}
			})
			for (const i in features) {
				response_features[i].response = features[i].response;
				await response_features[i].save()
			}
			return res.status(200).json({ message: "Alteração concluída", features, features_version, response_features });

		} catch (error) {
			return res.status(400).json({ message: error.message })
		}
	});

}
