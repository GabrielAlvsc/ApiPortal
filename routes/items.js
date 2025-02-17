module.exports = (app) => {
    const { v4: uuidv4 } = require('uuid');
    const { Op, where } = require("sequelize");

    async function childrens(root) {
        console.log(root)
        directChildren = await app.models.items.findAll({
            where: {
                version_id: root.version_id,
                father_id: root.id
            }
        });
        if (directChildren) {
            let nodeList = []
            for (const index in directChildren) {
                childrens(directChildren[index])
                nodeList.push(directChildren[index])
                root.setDataValue("nodes", nodeList)
                
            }
        }
        
    }

    app.post("/itemSwapOrders", app.auth.cdt, async (req, res) => { //swap OK -- Adaptacao pra subitens no front
        try {
            let { id0, id1, order0, order1 } = req.body;
            let item0 = await app.models.items.findByPk(id0);
            let item1 = await app.models.items.findByPk(id1);
            if (!item0 || !item1) {
                return res.status(400).json({ message: "Item inexistente" });
            }
            // verificar se o item pertence ao mesmo caderno
            if (item0.version_id !== item1.version_id) {
                return res.status(400).json({ message: "Os itens não são do mesmo caderno" });
            }
            // verificar se eles pertencem a um mesmo item pai
            if (item0.father_id !== item1.father_id) {
                return res.status(400).json({ message: "Os itens não estão no mesmo nível" });
            }
            // verificar se a versão foi concluída
            const version = await app.models.versions.findByPk(item0.version_id);
            if (version.concluded) {
                return res.status(400).json({ message: "Os itens pertencem a uma versão concluída" });
            }
            // verificar se os items tem a mesma ordem
            if (item0.order === item1.order) {

                // pegar todos os items da versão
                let myitems = await app.models.items.findAll({
                    where: { 
                        version_id: item0.version_id,
                        father_id: item0.father_id
                    },
                    order: [['order', 'ASC']]
                });
                for (const index in myitems) {
                    if (myitems[index].id === id0) {
                        order0 = +index + 1;
                    } else if (myitems[index].id === id1) {
                        order1 = +index + 1;
                    } else {
                        await app.models.items.update({ order: +index + 1 }, { where: { id: myitems[index].id } });
                    }
                };

                await app.models.items.update({ order: order1 }, { where: { id: id0 } });
                await app.models.items.update({ order: order0 }, { where: { id: id1 } });
                return res.status(200).json({ message: "Foi encontrado uma inconsistencia nos dados e já foi normalizado" });
            }
            // fazer a troca ocorrer só se item0.father_id === item1.father_id
            await app.models.items.update({ order: order1 }, { where: { id: id0 } });
            await app.models.items.update({ order: order0 }, { where: { id: id1 } });
            return res.status(200).json({ message: "swap success" });
        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.post('/item', app.auth.cdt, async (req, res) => { //rota mantida para itens
        try {
            const { version_id, title, description, fillable, mandatory } = req.body; //is_subitem e father_id aqui
            if (!title) {
                return res.status(400).json({ message: "O campo 'title' é obrigatório" })
            }
            if (!description) {
                return res.status(400).json({ message: "O campo 'description' é obrigatório" })
            }
            const version = await app.models.versions.findOne({
                where: { id: version_id },
                include: [{ model: app.models.models }],
            });
            // verificar se a versão foi concluida
            /**
             * Check if the version has been concluded.
             * If not, find the maximum item order for the version and increment it by 1
             * Otherwise, set the newMaxItem to 1
             */
            if (!version) {
                return res.status(400).json({ message: "Versão não encontrada" })
            }

            if (version.concluded) {
                return res.status(400).json({ message: "Versão já concluída" })
            }
            // check if title already exists in the version
            const item = await app.models.items.findOne({
                where: {
                    version_id: version_id, // Filter items by version ID
                    title: title, // Filter items by title
                },
            });
            if (item) {
                return res.status(400).json({ message: `Item com o titulo "${title}" já existe` })
            }


            // Find the item with the maximum order for the given version
            let maxItem = await app.models.items.findOne({
                where: {
                    version_id: version_id, // Filter items by version ID
                    is_subitem: false //troca para atender subitems - maxItem deve pegar a ordem só de items sem pais
                },
                order: [['order', 'DESC']], // Sort items by order in descending order
            });

            // Initialize the newMaxItem to 1
            let newMaxItem = 1;

            // If a maximum item is found, set the newMaxItem to its order + 1
            if (maxItem) {
                newMaxItem = 1 + maxItem.order;
            }
            const newItem = await app.models.items.create({ version_id, title, description, fillable, mandatory, order: newMaxItem });

            app.log.register(app.log.actions.createItem, req.userId,
                `"${req.user.name}" Criou o item "${title}" no modelo " ${version.model.title} V${version.version}"`,
                { version_id: version.id, model_id: version.model_id, item_id: newItem.id },);

            return res.status(201).json(newItem)
        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.get('/item/version/:idVersion/', app.auth.cdt, async (req, res) => {//esse nao precisa mudar
        try {
            const { idVersion } = req.params;

            const itemsInVersion = await app.models.items.findAll({
                where: {
                    version_id: idVersion,
                },
            });

            return res.status(200).json(itemsInVersion)
        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.get("/item/:idItem", app.auth.cdt, async (req, res) => { //nem esse
        try {
            const { idItem } = req.params;
            const where = { id: idItem };
            const result = await app.models.items.findOne({ where });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.post('/subitem', app.auth.cdt, async (req, res) => { //post pra subitem
        try {
            const { version_id, title, description, fillable, mandatory, is_subitem, father_id } = req.body; //is_subitem e father_id aqui
            if (!title) {
                return res.status(400).json({ message: "O campo 'title' é obrigatório" })
            }
            if (!description) {
                return res.status(400).json({ message: "O campo 'description' é obrigatório" })
            }
            if (!father_id) {
                return res.status(400).json({ message: "Selecione um item pai para o tipo sub-item" })
            }
            const version = await app.models.versions.findOne({
                where: { id: version_id },
                include: [{ model: app.models.models }],
            });
            // verificar se a versão foi concluida
            /**
             * Check if the version has been concluded.
             * If not, find the maximum item order for the version and increment it by 1
             * Otherwise, set the newMaxItem to 1
             */
            if (!version) {
                return res.status(400).json({ message: "Versão não encontrada" })
            }

            if (version.concluded) {
                return res.status(400).json({ message: "Versão já concluída" })
            }
            // check if title already exists in the version
            const item = await app.models.items.findOne({
                where: {
                    version_id: version_id, // Filter items by version ID
                    title: title, // Filter items by title
                },
            });
            if (item) {
                return res.status(400).json({ message: `Item com o titulo "${title}" já existe` })
            }

            const father = await app.models.items.findOne({
                where: {
                    version_id: version_id, // Filter items by version ID
                    id: father_id       // Check if exists a item with this id              
                }
            })
            if (!father) {
                return res.status(400).json({ message: `Item pai: ${father.title} não existe` })
            }


            // Find the item with the maximum order for the given version
            let maxItem = await app.models.items.findOne({
                where: {
                    version_id: version_id, // Filter items by version ID
                    father_id: father_id //Filter by the same father_id
                },
                order: [['order', 'DESC']], // Sort items by order in descending order
            });

            // Initialize the newMaxItem to 1
            let newMaxItem = 1;

            // If a maximum item is found, set the newMaxItem to its order + 1
            if (maxItem) {
                newMaxItem = 1 + maxItem.order;
            }
            const newItem = await app.models.items.create({ version_id, title, description, fillable, mandatory, is_subitem, father_id, order: newMaxItem });

            app.log.register(app.log.actions.createItem, req.userId,
                `"${req.user.name}" Criou o subitem "${title}" ligado a "${father.order}. ${father.title}" no modelo " ${version.model.title} V${version.version}"`,
                { version_id: version.id, model_id: version.model_id, item_id: newItem.id },);

            return res.status(201).json(newItem)
        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.patch("/item/:idItem", app.auth.cdt, async (req, res) => { 
        try {
            const { idItem } = req.params;
            const { title, description, order, fillable, mandatory, is_subitem, father_id } = req.body;
            const item = await app.models.items.findByPk(idItem);
            const version = await app.models.versions.findOne({ where: { id: item.version_id }, include: [{ model: app.models.models }] });
            if (version.concluded) {
                return res.status(400).json({ message: "Não é possível editar um item de uma versão concluída", item, version });
            }
            // check if title already exists in the version
            const anotherItem = await app.models.items.findOne({
                where: {
                    version_id: item.version_id, // Filter items by version ID
                    title: title, // Filter items by title
                    id: { [Op.ne]: idItem },
                },
            });
            if (anotherItem) {
                return res.status(400).json({ message: `Item com o titulo "${title}" já existe` });
            }


            const result = await app.models.items.update({ title, description, order: newMaxItem, fillable, mandatory, is_subitem, father_id }, { where: { id: idItem } });
            if (result == 1) {
                app.log.register(app.log.actions.updateItem, req.userId,
                    `"${req.user.name}" Atualizou o item "${title}" no modelo " ${version.model.title} V${version.version}"`,
                    { version_id: version.id, model_id: version.model_id, item_id: idItem },);
                return res.status(200).json({ message: "Atualizado com sucesso" });
            } else {
                return res.status(400).json({ message: "Erro ao atualizar" });
            }

        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.patch("/subitem/:idItem", app.auth.cdt, async (req, res) => { 
        try {
            const { idItem } = req.params;
            const { title, description, order, fillable, mandatory, is_subitem, father_id } = req.body;
            const item = await app.models.items.findByPk(idItem);
            const version = await app.models.versions.findOne({ where: { id: item.version_id }, include: [{ model: app.models.models }] });
            if (version.concluded) {
                return res.status(400).json({ message: "Não é possível editar um item de uma versão concluída", item, version });
            }
            // check if title already exists in the version
            const anotherItem = await app.models.items.findOne({
                where: {
                    version_id: item.version_id, // Filter items by version ID
                    title: title, // Filter items by title
                    id: { [Op.ne]: idItem },
                },
            });
            if (anotherItem) {
                return res.status(400).json({ message: `Item com o titulo "${title}" já existe` });
            }
            let fid = 0;
            let newMaxItem = 1;
            if (!is_subitem) {
                let maxItem = await app.models.items.findOne({
                    where: {
                        version_id: item.version_id,
                        is_subitem: false
                    },
                    order: [['order', 'DESC']]
                });

                if (maxItem) {
                    newMaxItem = 1 + maxItem.order;
                }
                if (item.father_id == fid) {
                    newMaxItem = item.order
                }
            }
            if (is_subitem) {
                fid = father_id;
                let maxItem = await app.models.items.findOne({
                    where: {
                        version_id: item.version_id,
                        father_id: fid
                    },
                    order: [['order', 'DESC']]
                });

                if (maxItem) {
                    newMaxItem = 1 + maxItem.order;
                }
                if (item.father_id == fid) {
                    newMaxItem = item.order;
                }
            }

            console.log(newMaxItem);

            const result = await app.models.items.update({ title, description, order: newMaxItem, fillable, mandatory, is_subitem, father_id: fid }, { where: { id: idItem } });
            if (result == 1) {
                app.log.register(app.log.actions.updateItem, req.userId,
                    `"${req.user.name}" Atualizou o item "${title}" no modelo " ${version.model.title} V${version.version}"`,
                    { version_id: version.id, model_id: version.model_id, item_id: idItem },);
                return res.status(200).json({ message: "Atualizado com sucesso" });
            } else {
                return res.status(400).json({ message: "Erro ao atualizar" });
            }

        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.delete('/item/:idItem', app.auth.cdt, async (req, res) => { //verificar se item deletado tem subitems - permitir delete perguntando ao usuario, mas removendo todos os subitems tbm
        try {
            const { idItem } = req.params;
            // verifica se o item existe
            const item = await app.models.items.findByPk(idItem);
            // verificar se a versão que o item pertence, está em edição
            const version = await app.models.versions.findByPk(item.version_id, { include: [{ model: app.models.models }] });
            if (version.concluded) {
                return res.status(400).json({ message: "Item pertence a uma versão finalizada!" });
            }

            let children = await app.models.items.findOne({ //impedir deleção de itens com subitens
                where: {
                    version_id: item.version_id,
                    father_id: item.id
                }
            });

            if (children) {
                //console.log(children); //debug delete de itens com filhos
                return res.status(400).json({ message: "Impossível deletar itens que possuem sub-itens" });
            }
            // procurar todas imagens do item
            const imagesInItem = await app.models.images.findAll({
                where: {
                    item_id: idItem,
                },
            });

            // apagar as imagens do item
            for (const image of imagesInItem) {
                await image.destroy();
            }
            // procurar os fields do item
            const fieldsInItem = await app.models.fields.findAll({
                where: {
                    item_id: idItem,
                },
            });
            // apagar os fields do item
            for (const field of fieldsInItem) {
                await field.destroy();
            }
            // Apaga o item
            await app.models.items.destroy({ where: { id: idItem } })
            app.log.register(app.log.actions.deleteItem, req.userId,
                `"${req.user.name}" Apagou o item "${item.title}" no modelo " ${version.model.title} V${version.version}"`,
                { version_id: version.id, model_id: version.model_id, item_id: idItem },);

            return res.status(200).json({ message: "Item apagado com sucesso" })
        }
        catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.post('/copyItem', async (req, res) => { // ver como vai ser a cópia dos items
        try {
            let { modelDest, items } = req.body;
            const model = await app.models.models.findByPk(modelDest);
            if (!model) {
                return res.status(400).json({ message: "Modelo inexistente" });
            }
            const version = await app.models.versions.findOne({ where: { model_id: modelDest, concluded: false } });
            if (!version) {
                return res.status(400).json({ message: "Versão já concluída" });
            }
            // remove os duplicados e nulos
            items = [...new Set(items)].filter(Boolean);
            // pegar todos os itens pelo id
            items = await app.models.items.findAll({
                where: {
                    id: { [Op.in]: items },

                },
                order: [['is_subitem','ASC']],
                include: [{
                    model: app.models.fields,
                    include: [{
                        model: app.models.features
                    }]
                }]
            });
            items = items.map(item => item.toJSON());
            let lastItemOrder = await app.models.items.findOne({
                raw: true,
                where: {
                    version_id: version.id,
                    is_subitem: false
                },
                order: [['order', 'DESC']]
            });
            let lastFeatureOrder = await app.models.features.findOne({
                raw: true,
                where: {
                    version_id: version.id
                },
                order: [['order', 'DESC']]
            })
            lastItemOrder = lastItemOrder ? lastItemOrder.order : 0;
            lastFeatureOrder = lastFeatureOrder ? lastFeatureOrder.order : 0;
            let flag = false;
            let subitemsflagged = [];
            for (const item of items) {
                let newItem
                const outroItem = await app.models.items.findOne({ where: { title: item.title, version_id: version.id } });
                if (outroItem) {
                    item.title = `${item.title}-${uuidv4()}`
                }
                
                item.order = lastItemOrder + 1;
                lastItemOrder += 1;

                if (item.is_subitem) {
                    
                    flag = true;
                    subitemsflagged.push(item.id);
                    let father = await app.models.items.findOne({
                        where: {
                            version_id: item.version_id,
                            id: item.father_id
                        }
                    });
                    let newFather = await app.models.items.findOne({
                        where: {
                            version_id: version.id,
                            title: father.title
                        }
                    });
                    if (newFather) {
                        let lastSubitemOrder = await app.models.items.findOne({
                            raw: true,
                            where: {
                                version_id: version.id,
                                father_id: newFather.id
                            },
                            order: [['order', 'DESC']]
                        });
                        lastSubitemOrder = lastSubitemOrder ? lastSubitemOrder.order : 0;
                        newItem = await app.models.items.create({
                            title: item.title,
                            description: item.description,
                            order: lastSubitemOrder+1,
                            version_id: version.id,
                            fillable: item.fillable,
                            mandatory: item.mandatory,
                            is_subitem: item.is_subitem,
                            father_id: newFather.id
                        });
                    } else {
                        newItem = await app.models.items.create({
                            title: item.title,
                            description: item.description,
                            order: item.order,
                            version_id: version.id,
                            fillable: item.fillable,
                            mandatory: item.mandatory,
                            is_subitem: false,
                            father_id: 0
                        });
                    }
                } else {
                    newItem = await app.models.items.create({
                        title: item.title,
                        description: item.description,
                        order: item.order,
                        version_id: version.id,
                        fillable: item.fillable,
                        mandatory: item.mandatory,
                        is_subitem: false,
                        father_id: 0
                    });
                }

                if (!item.fillable) continue;
                for (const field of item.fields) {
                    if (field.feature) {
                        const outraFeature = await app.models.features.findOne({ where: { name: field.feature.name, version_id: version.id } });
                        if (outraFeature) {
                            field.feature.name = `${field.feature.name}-${uuidv4()}`
                        }
                        const newFeature = await app.models.features.create({
                            name: field.feature.name,
                            version_id: version.id,
                            order: lastFeatureOrder + 1,
                            is_variable: field.feature.is_variable
                        });
                        field.feature_id = newFeature.id;
                        lastFeatureOrder += 1;
                    }
                    await app.models.fields.create({
                        title_field: field.title_field,
                        standard_value: field.standard_value,
                        order_field: field.order_field,
                        item_id: newItem.id,
                        type_field_id: field.type_field_id,
                        feature_id: field.feature_id,
                    });
                }
            }
            return res.status(200).json({ message: "OK" })
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }

    })

    app.get("/tree/:idItem", app.auth.cdt, async (req, res) => {
        try {
            const { idItem } = req.params;

        // Função recursiva para buscar os filhos
        async function getChildren(item) {
            // Buscando filhos do item atual
            const children = await app.models.items.findAll({
                where: {
                    father_id: item.id
                }
            });

            // Construindo a estrutura com filhos recursivamente
            return await Promise.all(children.map(async (child) => ({
                ...child.toJSON(),
                nodes: await getChildren(child) // Chamando recursivamente
            })));
        }

        // Buscando o nó raiz
        const rootItem = await app.models.items.findOne({
            where: {
                id: idItem
            }
        });

        if (!rootItem) {
            return res.status(404).json({ message: "Item raiz não encontrado" });
        }

        let childItens = await getChildren(rootItem)
        if (childItens.length == 0) childItens = []

        rootItem.setDataValue("nodes", await getChildren(rootItem))

        // Construindo a árvore
        const result = {
            rootItem
        };

        return res.status(200).json(rootItem);
        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    // Função recursiva para coletar IDs de todos os descendentes
    async function getDescendantIds(item, models) {
        const children = await models.items.findAll({
            where: {
                father_id: item.id
            }
        });

        // Coleta os IDs dos filhos e chama recursivamente
        const ids = children.map(child => child.id);
        for (const child of children) {
            ids.push(...await getDescendantIds(child, models));
        }

        return ids;
    }

    // Rota para obter a lista de IDs
    app.get("/treeids/:idItem", app.auth.cdt, async (req, res) => {
        try {
            const { idItem } = req.params;

            // Busca o item raiz
            const rootItem = await app.models.items.findOne({
                where: {
                    id: idItem
                }
            });

            if (!rootItem) {
                return res.status(404).json({ message: "Item raiz não encontrado" });
            }

            // Coleta os IDs de todos os descendentes
            const descendantIds = await getDescendantIds(rootItem, app.models);

            // Inclui o ID do item raiz no resultado
            const result = [rootItem.id, ...descendantIds];

            return res.status(200).json(result);
        } catch (error) {
            console.error(error); // Para depuração
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    });

    app.get("/debugItems/:idBook", app.auth.cdt, async (req, res) => {
        try {
            const { idBook } = req.params
            const book = await app.models.books.findByPk(idBook)
            let items = await app.models.items.findAll({
                where: {
                    version_id: book.version_id,
                    is_subitem: false
                },
                order: [['order','ASC']]
            });
            items = await Promise.all(items.map(
                async item => {
                    item = item.get({ plain: true });
                    let subitems = await app.models.items.findAll({
                        where: {
                            father_id: item.id
                        }
                    });
                    item["subitems"] = subitems;
                    return item;
                }
                
            ))
            return res.status(200).json(items);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu erro" });
        }
        
    })

    app.get("/debugItemsFullOrder/:idBook", app.auth.cdt, async (req, res) => {
        try {
            const { idBook } = req.params
            const book = await app.models.books.findByPk(idBook)
            let items = await app.models.items.findAll({
                where: {
                    version_id: book.version_id,

                },
                order: [['order','ASC']]
            });

            for (const item in items) {
                let fullOrder = ""
                //console.log(items[item].is_subitem)
                if (!items[item].is_subitem) {
                  fullOrder = String(items[item].order)
                  //console.log(fullOrder)
                } else {
                  let i = items[item]
                  fullOrder = String(items[item].order)
                  while (i.is_subitem != false) {
                    fid = i.father_id
                    i = await app.models.items.findOne({
                      where: {
                        id: fid
                      }
                    })
                    fullOrder = String(i.order) + "." + fullOrder
        
                    
                  }
                  //console.log(fullOrder);
                }
                items[item].setDataValue("fullorder", fullOrder);
                //console.log(items[item])
                
              }
        
              //ordenar items por fullOrder
              items.sort((a, b) => {
                const orderA = a.getDataValue("fullorder");
                const orderB = b.getDataValue("fullorder");
                return orderA.localeCompare(orderB, "en", { numeric: true });
              });

            return res.status(200).json(items);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu erro" });
        }
        
    })
}
