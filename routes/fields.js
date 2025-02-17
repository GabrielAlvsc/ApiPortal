module.exports = (app) => {
    const jwt = app.auth;
    const Fields = app.models.fields;
    const TypeFields = app.models.type_fields;
    const Items = app.models.items;
    const Versions = app.models.versions;


    const checkItemCanEdit = async (idItem) => {
        const item = await Items.findByPk(idItem, {
            include: [{
                model: Versions,
                as: 'itemVersion',
                include: [{
                    model: app.models.models,
                }]
            }]
        });

        if (!item) {
            return [false, "O campo informado não existe", null]
        }


        if (item.itemVersion.concluded) {
            return [false, "A versão foi concluída", null]
        }

        return [true, "", item];
    };
    const checkFieldCanEdit = async (idField) => {
        const field = await Fields.findByPk(idField, {
            include: [{
                model: Items,
                include: [{
                    model: Versions,
                    as: 'itemVersion',
                    include: [{
                        model: app.models.models,
                    }]
                }]
            }]
        });

        if (!field) {
            return false, ["O campo informado não existe", null]
        }

        if (field.item.itemVersion.concluded) {
            return [false, "A versão foi concluída", null]
        }
        return [true, "", field];
    };


    app.post('/field', jwt.cdt, async (req, res) => {
        try {
            const { item_id } = req.body;
            // let order_field = 0;
            const [canEdit, message, item] = await checkItemCanEdit(item_id);

            if (canEdit === false) {
                return res.status(400).json({ message });
            }

            let { type_field_id, version_id, order_field, standard_value, title_field, feature_id } = req.body;
            if (type_field_id != 5) {
                feature_id = undefined;
            }
            const newField = await app.models.fields.create({ item_id, type_field_id, order_field, version_id, standard_value, title_field, feature_id });

            app.log.register(app.log.actions.createField, req.userId,
                `"${req.user.name}" Criou o field "${title_field}" no modelo " ${item.itemVersion.model.title} V${item.itemVersion.version}"`,
                { version_id: item.itemVersion.id, model_id: item.itemVersion.model_id, field_id: newField.id, item_id: item.id },);

            return res.status(201).json(newField)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.get('/fields', jwt.cdt, async (req, res) => {
        try {
            const result = Fields.findAll();
            return res.status(200).json(result)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.get('/fieldsVersion/:idVersion', jwt.cdt, async (req, res) => {
        try {
            const { idVersion } = req.params;
            const itemsForVersion = await Items.findAll({
                where: {
                    version_id: idVersion,
                },
            });

            const fieldsForItems = [];
            for (const item of itemsForVersion) {
                const fieldsForItem = await Fields.findAll({
                    where: {
                        item_id: item.id,
                    },
                });
                fieldsForItems.push(...fieldsForItem);
            }

            return res.status(200).json(fieldsForItems);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.get('/fields/:idItem', jwt.cdt, async (req, res) => {
        try {
            const { idItem } = req.params;

            const fieldsForItem = await Fields.findAll({
                where: {
                    item_id: idItem,
                },
                order: [['order_field', 'ASC']],

            });
            return res.status(200).json(fieldsForItem)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.get('/typeFields', jwt.cdt, async (req, res) => {
        try {
            const result = await TypeFields.findAll();
            return res.status(200).json(result)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.patch("/field/:idField", jwt.cdt, async (req, res) => {
        try {
            const { idField } = req.params;

            const [canEdit, message, field] = await checkFieldCanEdit(idField);

            if (canEdit === false) {
                return res.status(400).json({ message });
            }
            let { standard_value, title_field, feature_id } = req.body;

            if (field.type_field_id != 5) {
                feature_id = undefined;
            }
            const result = await app.models.fields.update({ standard_value, title_field, feature_id }, { where: { id: idField } });

            if (result == 1) {
                app.log.register(app.log.actions.updateField, req.userId,
                    `"${req.user.name}" Alterou o field "${title_field}" no modelo " ${field.item.itemVersion.model.title} V${field.item.itemVersion.version}"`,
                    { version_id: field.item.itemVersion.id, model_id: field.item.itemVersion.model_id, field_id: field.id, item_id: field.item.id },);

                return res.status(200).json({ message: "Atualizado com sucesso" });
            } else {
                return res.status(400).json({ message: "Erro ao atualizar" });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação", error });
        }
    });

    app.delete('/field/:idField', jwt.cdt, async (req, res) => {
        try {
            const { idField } = req.params;
            const where = { id: idField };
            const [canEdit, message, field] = await checkFieldCanEdit(idField);
            if (canEdit === false) {
                return res.status(400).json({ message });
            }

            if (!field) {
                return res.status(400).json({ message });
            }
            await Fields.destroy({ where })
            app.log.register(app.log.actions.deleteField, req.userId,
                `"${req.user.name}" Apagou o field "${field.title_field}" no modelo " ${field.item.itemVersion.model.title} V${field.item.itemVersion.version}"`,
                { version_id: field.item.itemVersion.id, model_id: field.item.itemVersion.model_id, field_id: field.id },);
            return res.status(200).json({ message: "Campo apagado com sucesso" })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    });

    app.post("/fieldSwapOrders", jwt.cdt, async (req, res) => {
        try {
            let { id0, id1, order0, order1 } = req.body;

            const field0 = await Fields.findByPk(id0);
            const field1 = await Fields.findByPk(id1);
            if (!field0 || !field1) {
                return res.status(400).json({ message: "Field inexistente" });
            }
            if (field0.version_id != field1.version_id) {
                return res.status(400).json({ message: "Os campos não são do mesmo caderno" });
            }
            if (field0.item_id != field1.item_id) {
                return res.status(400).json({ message: "Os campos não são do mesmo item" });
            }
            const itemField0 = await Items.findByPk(field0.item_id)
            const versionField0 = await Versions.findByPk(itemField0.version_id);

            if (versionField0.concluded) {
                return res.status(400).json({ message: "Os campos pertencem a uma versão concluída" });
            }

            if (field0.order === field1.order) {
                let myFields = await Fields.findAll({
                    where: { item_id: field0.item_id },
                    order: [['order_field', 'ASC']]
                });
                for (let i = 0; i < myFields.length; i++) {
                    if (myFields[i].id === id0) {
                        order0 = i
                    } else if (myFields[i].id === id1) {
                        order1 = i
                    } else {
                        await Fields.update({ order_field: i }, { where: { id: myFields[i].id } });
                    }
                }
            }
            await Fields.update({ order_field: order1 }, { where: { id: id0 } });
            await Fields.update({ order_field: order0 }, { where: { id: id1 } });
            return res.status(200).json({ message: 'swapado' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação", error: error.toString() });
        }
    });
}