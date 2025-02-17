module.exports = (app) => {
    const jwt = app.auth;
    const features = app.models.features;
    const versions = app.models.versions;
    const fields = app.models.fields;
    const items = app.models.items;
    const { Op } = require("sequelize")

    app.post("/featureSwapOrders", jwt.cdt, async (req, res) => {
        try {
            const { id0, id1, order0, order1 } = req.body;

            const feature0 = await features.findByPk(id0);
            const feature1 = await features.findByPk(id1);
            if (!feature0 || !feature1) {
                return res.status(400).json({ message: "Feature inexistente" });
            }

            if (feature0.version_id !== feature1.version_id) {
                return res.status(400).json({ message: "As features não são do mesmo caderno" });
            }

            const version = await versions.findByPk(feature0.version_id);
            if (version.concluded) {
                return res.status(400).json({ message: "As features pertencem a uma versão concluída" });
            }

            if (feature0.order === feature1.order) {
                const myFeatures = await features.findAll({
                    where: { version_id: feature0.version_id },
                    order: [['order', 'ASC']],
                });
                for (let index = 0; index < myFeatures.length; index++) {
                    if (myFeatures[index].id === feature0.id) {
                        order0 = +index + 1;
                    } else if (myFeatures[index].id === feature1.id) {
                        order1 = +index + 1;
                    } else {
                        await features.update({ order: +index + 1 }, { where: { id: myFeatures[index].id } });
                    }
                }
                await features.update({ order: newMaxFeatures }, { where: { id: id0 } });
                await features.update({ order: newMaxFeatures }, { where: { id: id1 } });
                return res.status(200).json({ message: "swap success" });
            }
            await features.update({ order: order1 }, { where: { id: id0 } });
            await features.update({ order: order0 }, { where: { id: id1 } });
            return res.status(200).json({ message: 'swapado' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação", error: error.toString() });
        }
    });
    app.post('/features', jwt.cdt, async (req, res) => {
        try {
            const { name, version_id, is_variable } = req.body;

            const version = await versions.findOne({
                where: { id: version_id },
                include: [{ model: app.models.models }],
            });

            if (!version) {
                return res.status(400).json({ message: "Versão não encontrada" })
            } if (version.concluded) {
                return res.status(400).json({ message: "Versão já concluida" })
            }

            // verifica se existem uma feature com mesmo nome nessa versão
            const feature = await features.findOne({
                where: { name: name, version_id: version_id },
            })

            if (feature) {
                return res.status(400).json({ message: "Ja existe uma feature com esse nome nessa versão" })
            }

            let maxFeatures = await features.findOne({
                where: { version_id: version_id },
                order: [['order', 'DESC']],
            });
            let newMaxFeatures = 1;
            if (maxFeatures) {
                newMaxFeatures = 1 + maxFeatures.order;
            }

            const result = await features.create({ name, version_id, is_variable, order: newMaxFeatures });

            app.log.register(app.log.actions.createFeature, req.userId,
                `"${req.user.name}" Criou a feature "${name}" no modelo " ${version.model.title} V${version.version}"`,
                { version_id: version.id, model_id: version.model_id, feature_id: result.id },);

            return res.status(201).json(result)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
        }
    })

    app.get('/features/:id', jwt.cdt, async (req, res) => {
        try {
            const { id } = req.params;
            const where = { id: id };
            const result = await features.findOne({ where });
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.patch('/features/:id', jwt.cdt, async (req, res) => {
        try {
            const { id } = req.params;
            const where = { id: id };

            const feature = await features.findOne({ where });
            const version = await versions.findOne({ where: { id: feature.version_id }, include: [{ model: app.models.models }] });
            const { name, is_variable, order, version_id } = req.body;
            if (version.concluded) {
                return res.status(400).json({ message: "Não é possível atualizar uma feature de uma versão concluída" });
            }
            if (feature.is_variable && req.body.is_variable === false) {
                const field = await fields.findOne({ where: { feature_id: id } });
                if (field) {
                    const item = await items.findByPk(field.item_id);
                    return res.status(400).json({ message: `A feature está associada ao item "${item.title}" e portanto deve continuar como "Preenchivel durante os testes"` });
                }
            }
            const result = await features.update({ name, is_variable, order }, { where });
            const outraFeature = await features.findOne({
                where: { name: name, version_id: version_id, id: { [Op.ne]: id } },
            })

            if (outraFeature) {
                return res.status(400).json({ message: "Ja existe uma feature com esse nome nessa versão" })
            }

            if (result == 1) {
                app.log.register(app.log.actions.updateFeature, req.userId,
                    `"${req.user.name}" Alterou a feature "${name}" no modelo " ${version.model.title} V${version.version}"`,
                    { version_id: version.id, model_id: version.model_id, feature_id: id },);

                return res.status(200).json({ message: "Atualizado com sucesso" });
            } else {
                return res.status(400).json({ message: "Erro ao atualizar" });
            }

        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
        }
    })

    app.delete('/features/:id', jwt.cdt, async (req, res) => {
        try {
            const { id } = req.params;
            const where = { id: id };
            const feature = await features.findByPk(id);
            if (!feature) {
                return res.status(400).json({ message: "Característica não encontrada" });
            }
            const version = await versions.findOne({ where: { id: feature.version_id }, include: [{ model: app.models.models }] });
            if (version.concluded) {
                return res.status(400).json({ message: "Não é possível apagar uma feature de uma versão concluída" });
            }
            const field = await fields.findOne({ where: { feature_id: id } });
            if (field) {
                const item = await items.findByPk(field.item_id);
                return res.status(400).json({ message: `A feature está associada ao item "${item.title}" e não pode ser apagada` });
            }
            await features.destroy({ where })

            app.log.register(app.log.actions.deleteFeature, req.userId,
                `"${req.user.name}" Deletou a feature "${feature.name}" no modelo " ${version.model.title} V${version.version}"`,
                { version_id: version.id, model_id: version.model_id, feature_id: id },);

            return res.status(201).json({ message: "Caracteristica apagada com sucesso" })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
        }
    })

    app.get('/getFeaturesCategory/:idVersion', jwt.cdt, async (req, res) => {
        try {
            const { idVersion } = req.params;
            let featuress = await features.findAll({
                where: {
                    is_variable: true,
                    version_id: idVersion
                }
            })

            let fieldsWithFeature = [];

            for (let i = 0; i < featuress.length; i++) {
                let field = await fields.findOne({
                    where: {
                        feature_id: featuress[i].id
                    }
                });
                if (field) {
                    fieldsWithFeature.push(field);
                }
            }

            let featuresNotAssociated = featuress.filter(feature => !fieldsWithFeature.some(field => field.feature_id === feature.id));

            return res.status(200).json(featuresNotAssociated)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
        }
    })
}
