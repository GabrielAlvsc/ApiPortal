module.exports = (app) => {

    async function prepareToCompare(version) {
        const keysItems = {};
        for (const item of version.versionItems) {
            const field = item.fields.map(field => {
                return `${field.title_field}-${field.standard_value}-${field.type_field_id}`;
            }).join('-');
            keysItems[item.title] = `${item.description}-${item.order}-${item.mandatory}-${field}`;
        }
        return { keysItems };
    }

    app.get('/generateComment/:idVersion', app.auth.cdt, async (req, res) => {
        try {
            const { idVersion } = req.params
            const attributes = { exclude: ["createdAt", "updatedAt"] };
            const include = [{ model: app.models.items, as: "versionItems", include: [{ model: app.models.fields, as: "fields", order: [['order', 'ASC']] }] }, { model: app.models.features, as: "versionDetails" }];
            const myVersion = await app.models.versions.findByPk(idVersion, { attributes, include })
            const previosVersion = await app.models.versions.findOne({ where: { model_id: myVersion.model_id, version: +myVersion.version - 1 }, include, attributes });
            if (!previosVersion) {
                return res.status(201).json({ comment: "Primeira versão" });
            }

            let comment = '';

            let current = await prepareToCompare(myVersion);
            let previos = await prepareToCompare(previosVersion);
            const itensAlterados = [];
            const itensRemovidos = [];
            const itensCadastrados = [];
            for (const key of Object.keys(previos.keysItems)) {
                if (!current.keysItems.hasOwnProperty(key)) {
                    itensRemovidos.push(`"${key}"`);
                }
            }
            for (const key of Object.keys(current.keysItems)) {
                if (!previos.keysItems.hasOwnProperty(key)) {
                    itensCadastrados.push(`"${key}"`);
                } else if (current.keysItems[key] !== previos.keysItems[key]) {
                    console.log("\n", current.keysItems[key], previos.keysItems[key], "\n")
                    itensAlterados.push(`"${key}"`);
                }
            }


            if (itensRemovidos.length > 0) {
                comment += `Removidos: ${itensRemovidos.join(",")}\n`;
            }
            if (itensCadastrados.length > 0) {
                comment += `Adicionados: ${itensCadastrados.join(",")}\n`;
            }
            if (itensAlterados.length > 0) {
                comment += `Alterados: ${itensAlterados.join(",")}\n`;
            }


            return res.status(201).json({ comment });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })


    app.get('/version', app.auth.cdt, async (req, res) => {
        try {
            const result = await app.models.versions.findAll();
            return res.status(201).json(result);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.get('/versionAll', app.auth.all, async (req, res) => {
        try {
            const result = await app.models.versions.findAll();
            return res.status(201).json(result);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.post('/editVersion/:idVersion', app.auth.cdt, async (req, res) => {
        try {
            const { idVersion } = req.params;
            const previousVersion = await app.models.versions.findOne({
                where: {
                    id: idVersion,
                },
                include: [
                    { model: app.models.models },
                ],
            })
            // verifica se a versão não foi concluida
            if (!previousVersion.concluded) {
                // como a versão não está concluida, não pode criar uma nova versão
                return res.status(400).json({ message: "Essa versão ainda não foi concluida para criar uma nova" });
            }
            // cria uma nova versão
            // VERIFICAR COMO PEGAR O USUÁRIO SOLICITANTE E ASSIM TORNA-LO  USUÁRIO RESPONSÁVEL
            const newVersion = await app.models.versions.create({
                concluded: false,
                version: previousVersion.version + 1,
                model_id: previousVersion.model_id,
                user_responsible_id: req.userId
            });

            const previousFeatures = await app.models.features.findAll({
                where: {
                    version_id: previousVersion.id,
                },
            });
            // features variaveis
            const variableFeatures = {};
            const previousItems = await app.models.items.findAll({
                where: {
                    version_id: previousVersion.id,
                },
                order: [['order','ASC']]
            });

            for (const item in previousItems) {
                let fullOrder = ""                
                if (!previousItems[item].is_subitem) {
                  fullOrder = String(previousItems[item].order)                  
                } else {
                  let i = previousItems[item]
                  fullOrder = String(previousItems[item].order)
                  while (i.is_subitem != false) {
                    fid = i.father_id
                    i = await app.models.items.findOne({
                      where: {
                        id: fid
                      }
                    })
                    fullOrder = String(i.order) + "." + fullOrder
                  }                  
                }
                previousItems[item].setDataValue("fullorder", fullOrder);                
                
              }
                      
              previousItems.sort((a, b) => {
                const orderA = a.getDataValue("fullorder");
                const orderB = b.getDataValue("fullorder");
                return orderA.localeCompare(orderB, "en", { numeric: true });
              });
              
            // copia as feature para a nova versão
            for (const feature of previousFeatures) {
                const newFeature = await app.models.features.create({
                    name: feature.name,
                    is_variable: feature.is_variable,
                    version_id: newVersion.id, // associa a nova versão
                    order: feature.order,
                });
                if (feature.is_variable) {
                    variableFeatures[feature.id] = newFeature.id; // guarda somente os ids que são de features variaveis
                }
            }
            // copia o item
            for (const item of previousItems) {
                // copia o item
                let fid = 0
                if (item.is_subitem){
                    let father = await app.models.items.findOne({
                        where: {
                            version_id: item.version_id,
                            id: item.father_id 
                        }
                    });
                    let newFather = await app.models.items.findOne({
                        where: {
                            version_id: newVersion.id,
                            title: father.title
                        }
                    });
                    fid = newFather.id
                }
                const newItem = await app.models.items.create({
                    title: item.title,
                    description: item.description,
                    order: item.order,
                    is_subitem: item.is_subitem,
                    father_id: fid,
                    version_id: newVersion.id,// associa a nova versão
                    mandatory: item.mandatory
                });
                const previousFields = await app.models.fields.findAll({
                    where: {
                        item_id: item.id,
                    },
                });

                for (const field of previousFields) {
                    if (field.type_field_id === 5) {// se é um campo variavel, então tem uma feature. Assume-se que está feature existe!
                        await app.models.fields.create({
                            title_field: field.title_field,
                            standard_value: field.standard_value,
                            order_field: field.order_field,
                            item_id: newItem.id,
                            type_field_id: field.type_field_id,
                            feature_id: variableFeatures[field.feature_id] /// field.feature_id vai sempre existir nas variableFeatures
                        });

                    } else {
                        // é um item não associado a feature
                        await app.models.fields.create({
                            title_field: field.title_field,
                            standard_value: field.standard_value,
                            order_field: field.order_field,
                            item_id: newItem.id,
                            type_field_id: field.type_field_id,
                        });
                    }
                }
            }

            app.log.register(app.log.actions.createNewVersion, req.userId || 0,
                `"${req.user.name}" criou a versão ${newVersion.version} para o modelo "${previousVersion.model.title}"`,
                { version_id: newVersion.id, model_id: newVersion.model_id },);

            return res.status(201).json({ message: "Nova versão criada e atualizada com sucesso!" });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.post("/closeVersion/:idVersion", app.auth.cdt, async (req, res) => {
        try {
            const { idVersion } = req.params;
            const { comment } = req.body
            const recentVersion = await app.models.versions.findOne({
                where: {
                    id: idVersion,
                },
                include: [
                    {
                        model: app.models.models
                    }
                ]
            })
            // verificar se tem features preenchiveis sem o campo que a preenche
            const features_preenchiveis = await app.models.features.findAll({
                where: {
                    version_id: recentVersion.id,
                    is_variable: true
                },
                include: [{
                    model: app.models.fields
                }]
            });
            for (const feature of features_preenchiveis) {
                if (!feature.field) {
                    return res.status(400).json({ message: `A Feature ${feature.name} não está associada a um campo!` });
                }
            }

            await recentVersion.update({ concluded: true, comment: comment });
            app.log.register(app.log.actions.closeVersion, req.userId || 0,
                `"${req.user.name}" finalizou  versão ${recentVersion.version} do modelo "${recentVersion.model.title}"`,
                { version_id: recentVersion.id, model_id: recentVersion.model_id },);

            return res.status(201).json({ message: "Versão concluida com sucesso!" })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })
}
