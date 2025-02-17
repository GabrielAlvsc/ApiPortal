module.exports = (app) => {
    const moment = require('moment-timezone');
    const { Op } = require('sequelize');

    app.post('/book', app.auth.cdt, async (req, res) => {
        try {
            const { model_id,
                equipament_id,
                user_responsible_id,
                user_executor_id,
                sgd,
                start_date,
                end_date,
                status
            } = req.body;

            const model = await app.models.models.findOne({
                raw: true,
                where: { id: model_id },
            });
            const equipment = await app.models.equipaments.findOne({
                raw: true,
                where: { id: equipament_id },
            });
            if (!equipment) {
                return res.status(400).json({ message: "Equipamento inexistente" });
            }
            const version = await app.models.versions.findOne({
                raw: true,
                where: { model_id: model_id, concluded: true },
                order: [['version', 'DESC']]
            });
            if (!version || !version.concluded) {
                return res.status(400).json({ message: "Versão ainda não foi concluida!" });
            }

            let version_id = version.id;
            const formattedStartDate = moment(start_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
            const formattedEndDate = moment(end_date, 'DD/MM/YYYY').format('YYYY-MM-DD');

            const startDateWithTimezone = moment.tz(formattedStartDate, 'YYYY-MM-DD', 'America/Sao_Paulo');
            const endDateWithTimezone = moment.tz(formattedEndDate, 'YYYY-MM-DD', 'America/Sao_Paulo');

            const bookResult = await app.models.books.create({
                equipament_id,
                user_responsible_id,
                user_executor_id,
                sgd,
                start_date,
                end_date,
                status,
                start_date: startDateWithTimezone,
                end_date: endDateWithTimezone,
                version_id, status: "Pendente"
            });

            const featuresBD = await app.models.features.findAll({
                where: { version_id: version.id },
            });

            const itemsBD = await app.models.items.findAll({
                where: { version_id: version.id },
            });

            for (const feature of featuresBD) {
                await app.models.response_features.create({
                    response: '',
                    book_id: bookResult.id,
                    feature_id: feature.id,

                });
            }

            for (const item of itemsBD) {
                if (item.fillable) {
                    const a = await app.models.response_items.create({
                        comment: '',
                        book_id: bookResult.id,
                        item_id: item.id
                    })

                    const fieldsBD = await app.models.fields.findAll({
                        where: {
                            item_id: item.id
                        },
                    });

                    for (const field of fieldsBD) {
                        await app.models.response_fields.create({
                            response: field.standard_value,
                            field_id: field.id,
                            response_item_id: a.id,
                        });
                    }
                }
            }
            app.log.register(app.log.actions.createBook, req.userId,
                `"${req.user.name}" criou o caderno  de testes "${model.title} V${version.version} ${equipment.vendor}  ${equipment.name}"`,
                { book_id: bookResult.id, user_responsible_id, equipment_id: equipament_id, model_id, version_id });

            return res.status(201).json({ message: "Caderno atribuido com sucesso!" });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.get('/books', app.auth.cdt, async (req, res) => {
        try {
            const result = await app.models.books.findAll({
                raw: true,
                nest: true,
                attributes: ['start_date', 'end_date', 'id', "status"],
                where: {
                    [Op.not]: [
                        { status: "Cancelado" }
                    ]
                },
                include: [
                    {
                        model: app.models.versions,
                        attributes: ['model_id'],
                        include: [
                            {
                                model: app.models.models,
                                attributes: ['title'],
                                include: [
                                    { model: app.models.categories, attributes: ['name'] }
                                ]
                            },
                        ]
                    },
                    {
                        model: app.models.equipaments,
                        attributes: ['name', 'vendor']
                    },
                    {
                        model: app.models.users,
                        as: 'user_responsible',
                        attributes: ['name']//{ exclude: ["password", "active", "ip"] }
                    },
                    {
                        model: app.models.users,
                        as: 'user_executor',
                        attributes: ['name']//{ exclude: ["password", "active", "ip"] }
                    },
                    // {   
                    //     required: false,
                    //     model: app.models.statusBook,
                    //     attributes: ['status']
                    // }
                ]
            });
            for (const book of result) {
                book.start_date = moment.tz(book.start_date, 'America/Sao_Paulo').format('DD/MM/YYYY');
                book.end_date = moment.tz(book.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY');
            }

            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.get('/booksInExecution', app.auth.cdt, async (req, res) => {
        try {
            const result = await app.models.books.findAll({
                where: {
                    status: "Pendente"
                },
                include: [
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models,
                                include: [
                                    { model: app.models.categories }
                                ]
                            }
                        ]
                    },
                    {
                        model: app.models.equipaments
                    },
                    {
                        model: app.models.users,
                        as: 'user_responsible',
                        attributes: { exclude: ["password", "active", "ip"] }
                    },
                    {
                        model: app.models.users,
                        as: 'user_executor',
                        attributes: { exclude: ["password", "active", "ip"] }
                    }
                ]
            });

            const formattedResult = result.map(book => {
                const startDate = moment.tz(book.start_date, 'America/Sao_Paulo').format('DD/MM/YYYY');
                const endDate = moment.tz(book.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY');

                return { ...book.dataValues, start_date: startDate, end_date: endDate };
            });

            return res.status(200).json(formattedResult);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.get('/deviceBooks/:idEquipment',
        // app.auth.cdt, 
        async (req, res) => {
            try {
                const { idEquipment } = req.params;
                let equipment = await app.models.equipaments.findByPk(idEquipment,
                    {
                        include: [
                            {
                                model: app.models.images,
                                order: [['id', 'DESC']],

                            }
                        ]
                    }
                );
                equipment = equipment.get({ plain: true });
                equipment.image = equipment.images.length > 0 ? equipment.images[equipment.images.length - 1] : '/uploads/default.png';

                const booksInEquipment = await app.models.books.findAll({
                    where: {
                        equipament_id: idEquipment
                    },
                    include: [
                        {
                            model: app.models.versions,
                            include: [
                                {
                                    model: app.models.models,
                                    include: [{
                                        model: app.models.categories
                                    }]
                                }
                            ]                        
                        },
                        {
                            model: app.models.users,
                            as: 'user_responsible',
                            attributes: { exclude: ["password", "active", "ip"] }
                        },
                        {
                            model: app.models.users,
                            as: 'user_executor',
                            attributes: { exclude: ["password", "active", "ip"] }
                        }
                    ], 
                    order: [['createdAt', 'DESC']],
                    limit: 1

                    
                });

                const formattedResult = booksInEquipment.map(bk => {
                    return {
                        model_id: bk.version.model_id,
                        book_id: bk.id,
                        version_id: bk.version_id,
                        category: bk.version.model.category.name,
                        model: bk.version.model.title,
                        version: bk.version.version,
                        status: bk.status,
                        date: moment.tz(bk.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY')
                    };
                });
                return res.status(200).json({
                    name: equipment.name,
                    sap: equipment.sap,
                    image: equipment.image ? equipment.image.path : null,
                    books: formattedResult
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
            }
        });

    app.get('/book/:id', app.auth.all, async (req, res) => {
        try {
            const { id } = req.params; // parametro id do caderno passado na url
            // encontra o caderno com o id passado na url
            let caderno = await app.models.books.findOne({
                raw: true, // Retornar um objeto json em vez de um objeto sequelize
                nest: true, // retorna com os sub objetos
                where: { id },
                attributes: { exclude: ['createdAt', 'updatedAt'] },

                include: [
                    {
                        model: app.models.equipaments,
                        attributes: ['name', 'vendor', 'price', 'endofsales', 'id', 'sap'],
                    }
                ]
            });

            if (!caderno) { // Se caderno é null então não encontrou nenhum caderno
                return res.status(400).json({ message: "Caderno não encontrado" });
            }
            // encontra a imagem do equipamento que pertence ao caderno
            let image = await app.models.images.findOne({ raw: true, where: { equipments_id: caderno.equipament_id } });

            caderno.equipament.image = image ? image.path : 'uploads/default.png';

            const version = await app.models.versions.findByPk(caderno.version_id,
                {
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    include: [{
                        model: app.models.models,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        include: [{
                            model: app.models.categories,
                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                        }]
                    }]
                }
            );

            let features = await app.models.features.findAll({
                where: { version_id: version.id },
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                order: [['order', 'ASC']],
                include: [
                    {
                        model: app.models.response_features,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        where: {
                            book_id: id
                        },
                        include: [{
                            model: app.models.correction_features
                        }
                        ]
                    }
                ]
            }
            );
            features = await Promise.all(features.map(
                async feature => {
                    feature = feature.get({ plain: true }); // converte sequelize object to json
                    feature.response_feature = feature.response_features.length > 0 ? feature.response_features[0] : null;
                    feature.response_features = undefined;
                    return feature;
                }
            ))


            let itens = await app.models.items.findAll({
                where: { version_id: version.id },
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                order: [['order', 'ASC']],
                include: [
                    {
                        model: app.models.response_items,
                        where: {
                            book_id: id
                        },
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                    {
                        model: app.models.fields,
                        order: [['order_field', 'ASC']],
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    }
                ]
            }
            );

            for (const item in itens) {
                let fullOrder = ""
                if (!itens[item].is_subitem) {
                    fullOrder = String(itens[item].order)
                } else {
                    let i = itens[item]
                    fullOrder = String(itens[item].order)
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
                itens[item].setDataValue("fullorder", fullOrder);
            }

            itens.sort((a, b) => {
                const orderA = a.getDataValue("fullorder");
                const orderB = b.getDataValue("fullorder");
                return orderA.localeCompare(orderB, "en", { numeric: true });
              });

            itens = await Promise.all(itens.map(
                async item => {
                    item = item.get({ plain: true });
                    item.response_item = item.response_items.length > 0 ? item.response_items[0] : null;
                    item.response_items = undefined;
                    if (item.response_item) {
                        for (const field of item.fields) {
                            let response_field = await app.models.response_fields.findOne({
                                where: { field_id: field.id, response_item_id: item.response_item.id },
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                include: [{
                                    model: app.models.images
                                }]
                            });
                            if (!response_field) {
                                continue;
                            }
                            field.response_field = response_field.get({ plain: true });
                            if (req.userProfile == "cdt") {
                                response_field.images = await Promise.all(response_field.images.map(
                                    async image => {
                                        image = image.get({ plain: true });
                                        image.otherResponseFields = [];

                                        if (image.hash == null) {
                                            return image;
                                        }
                                        const outros_response_fields = await app.models.images.findAll({
                                            where: { hash: image.hash, id: { [Op.ne]: image.id } },
                                            include: [{
                                                model: app.models.response_fields,
                                                include: [{
                                                    model: app.models.response_items,
                                                    include: [{
                                                        model: app.models.books,
                                                        include: [{
                                                            model: app.models.versions,
                                                            include: [{
                                                                model: app.models.models
                                                            }]
                                                        }, {
                                                            model: app.models.equipaments
                                                        }
                                                        ]
                                                    }]
                                                }]
                                            }]
                                        })


                                        image.otherResponseFields = await Promise.all(outros_response_fields.map(
                                            async other_response_field => {
                                                other_response_field = other_response_field.get({ plain: true });
                                                const formated = {
                                                    book_id: other_response_field.response_field.response_item.book_id,
                                                    item_id: other_response_field.response_field.response_item.item_id,
                                                    response_field_id: other_response_field.response_field_id,
                                                    response_item_id: other_response_field.response_field.response_item_id,
                                                    versao: other_response_field.response_field.response_item.book.version.version,
                                                    modelo: other_response_field.response_field.response_item.book.version.model.title,
                                                    equipamento: other_response_field.response_field.response_item.book.equipament.name,
                                                    vendor: other_response_field.response_field.response_item.book.equipament.vendor,
                                                }
                                                return formated;
                                            }
                                        ));
                                        return image;
                                    }
                                ))
                            }

                        }
                    }
                    return item;
                }))

            let canFinish = false;

            // ### Verificar se pode finalizar o caderno
            // Se o caderno estiver diferente de Pendente, então ele já está finalizado e nn precisa finalizar novamente

            if (caderno.status != "Pendente") {
                canFinish = false;
            } else if (req.userProfile == "cdt") {
                //Validar se todos os testes foram preenchidos e revidados
                where = { book_id: id, status: { [Op.notIn]: ["Aprovado", "Reprovado"] } }
                const not_finished_features = await app.models.response_features.findAll({ where });
                const not_finished_itens = await app.models.response_items.findAll({ where });
                canFinish = (not_finished_features.length == 0 && not_finished_itens.length == 0);
            }
            const userResponsible = await app.models.users.findOne({
                where: { id: caderno.user_responsible_id },
                attributes: { exclude: ["password", "ip", "active", 'createdAt', 'updatedAt'] },
            });

            const userExecutor = await app.models.users.findOne({
                where: { id: caderno.user_executor_id },
                attributes: { exclude: ["password", "ip", "active", 'createdAt', 'updatedAt'] },
            });

            // # formatar o retorno para o frontend
            const formattedResult = {
                ...caderno,
                canFinish,
                itens,
                version: version,
                start_date: moment.tz(caderno.start_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                end_date: moment.tz(caderno.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                features,
                userResponsible,
                userExecutor
            };
            return res.status(200).json(formattedResult);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    });

    app.get('/book/:idBook/features/:idFeature', app.auth.all, async (req, res) => {
        try {

            const { idBook, idFeature } = req.params;

            let book = await app.models.books.findByPk(idBook, {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                include: [
                    {
                        model: app.models.equipaments,
                        attributes: ['name', 'vendor', 'price', 'endofsales', 'id'],
                    },
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models
                            }
                        ]
                    }
                ]
            });

            if (!book) {
                return res.status(400).json({ message: "Caderno não encontrado" });
            }

            let feature = (await app.models.features.findByPk(idFeature, {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                order: [['order', 'ASC']],
                include: [
                    {
                        model: app.models.response_features,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        where: {
                            book_id: idBook
                        },
                        // Precisa colocar correlação
                        include: [{
                            model: app.models.correction_features
                        }
                        ]
                    }
                ]
            }
            ))?.toJSON();
            if (!feature) {
                return res.status(400).json({ message: "Características não encontradas" });
            }
            if (feature.version_id != book.version_id) {
                return res.status(400).json({ message: "Características não encontradas" });
            }
            feature.response_feature = feature.response_features.length > 0 ? feature.response_features[0] : null;
            feature.response_features = undefined;

            return res.status(200).json({ book, feature });

        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    });

    app.get('/book/:idBook/item/:idItem', app.auth.all, async (req, res) => {
        try {
            const { idBook, idItem } = req.params;

            let book = await app.models.books.findByPk(idBook, {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                include: [
                    {
                        model: app.models.equipaments,
                        attributes: ['name', 'vendor', 'price', 'endofsales', 'id'],
                    },
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models
                            }
                        ]
                    }
                ]
            });

            if (!book) {
                return res.status(400).json({ message: "Caderno não encontrado" });
            }

            const item = (await app.models.items.findByPk(idItem, {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                order: [['order', 'ASC']],
                include: [
                    {
                        model: app.models.response_items,
                        where: {
                            book_id: idBook
                        },
                        attributes: { exclude: ['createdAt', 'updatedAt'] },

                    },
                    {
                        model: app.models.fields,
                        order: [['order_field', 'ASC']],
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    }
                ]
            }
            ))?.toJSON();
            if (!item) {
                return res.status(400).json({ message: "Item não encontrado" });
            }
            if (item.version_id != book.version_id) {
                return res.status(400).json({ message: "Características não encontradas" });
            }
            item.response_item = item.response_items.length > 0 ? item.response_items[0] : null;
            item.response_items = undefined;
            if (item.response_item) {
                for (const field of item.fields) {
                    let response_field = await app.models.response_fields.findOne({
                        where: { field_id: field.id, response_item_id: item.response_item.id },
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        include: [{
                            model: app.models.images
                        }]
                    });
                    if (!response_field) {
                        continue;
                    }
                    field.response_field = response_field.get({ plain: true });
                    if (req.userProfile == "cdt") {
                        response_field.images = await Promise.all(response_field.images.map(
                            async image => {
                                image = image.get({ plain: true });
                                image.otherResponseFields = [];

                                if (image.hash == null) {
                                    return image;
                                }
                                const outros_response_fields = await app.models.images.findAll({
                                    where: { hash: image.hash, id: { [Op.ne]: image.id } },
                                    include: [{
                                        model: app.models.response_fields,
                                        include: [{
                                            model: app.models.response_items,
                                            include: [{
                                                model: app.models.books,
                                                include: [{
                                                    model: app.models.versions,
                                                    include: [{
                                                        model: app.models.models
                                                    }]
                                                }, {
                                                    model: app.models.equipaments
                                                }
                                                ]
                                            }]
                                        }]
                                    }]
                                })

                                image.otherResponseFields = await Promise.all(outros_response_fields.map(
                                    async other_response_field => {
                                        other_response_field = other_response_field.get({ plain: true });
                                        const formated = {
                                            book_id: other_response_field.response_field.response_item.book_id,
                                            item_id: other_response_field.response_field.response_item.item_id,
                                            response_field_id: other_response_field.response_field_id,
                                            response_item_id: other_response_field.response_field.response_item_id,
                                            versao: other_response_field.response_field.response_item.book.version.version,
                                            modelo: other_response_field.response_field.response_item.book.version.model.title,
                                            equipamento: other_response_field.response_field.response_item.book.equipament.name,
                                            vendor: other_response_field.response_field.response_item.book.equipament.vendor,
                                        }
                                        return formated;
                                    }
                                ));
                                return image;
                            }
                        ))
                    }

                }
                const correction_items = await app.models.correction_items.findAll({ where: { response_item_id: item.response_item.id, } });
                item.response_item.correction_items = correction_items;
            }

            return res.status(200).json({ book, item })
            // const item = result.itens.find(item => item.id == idItem);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }

    })

    app.post('/closeBook/:idBook', app.auth.all, async (req, res) => {
        try {
            const { idBook } = req.params;
            const book = await app.models.books.findOne({
                where: { id: idBook },
                include: [
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models
                            }
                        ]
                    },
                    {
                        model: app.models.equipaments
                    }
                ]
            });


            if (req.userId == book.user_executor_id) {
                await app.models.books.update({ status: "Em revisão" }, { where: { id: idBook } });

                app.log.register(app.log.actions.updateStatus, req.userId,
                    `"${req.user.name}" Finalizou a execução dos testes do caderno  de testes "${book.version.model.title} V${book.version.version} ${book.equipment.vendor} ${book.equipment.name}"`,
                    { book_id: book.id, user_executor_id: book.user_executor_id, equipment_id: book.equipament_id, model_id: book.version.model_id, version_id: book.version_id });

                return res.status(200).json({ message: "Caderno enviado para revisão!" })
            } else {
                return res.status(400).json({ message: "Somente o responsável pode fechar o caderno!" });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    })

    app.get('/myBooks', app.auth.all, async (req, res) => {
        try {
            // const currentDate = moment().format('YYYY-MM-DD');
            const currentDate = new Date();
            const lastDate = new Date();
            const lastDay = currentDate.getDate() - 1
            lastDate.setDate(lastDay)
            const result = await app.models.books.findAll({
                where: {
                    user_executor_id: req.userId,
                    status: "Pendente",
                    start_date: {
                        [Op.lte]: currentDate
                    },
                    end_date: {
                        [Op.gte]: lastDate
                    }
                },
                include: [
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models,
                                include: [
                                    { model: app.models.categories }
                                ]
                            }
                        ]
                    },
                    {
                        model: app.models.equipaments
                    },
                    {
                        model: app.models.users,
                        as: 'user_responsible',
                        attributes: { exclude: ["password", "active", "ip"] }
                    },
                    {
                        model: app.models.users,
                        as: 'user_executor',
                        attributes: { exclude: ["password", "active", "ip"] }
                    }
                ]
            });

            const formattedResult = result.map(book => {
                return {
                    ...book.dataValues,
                    start_date: moment.tz(book.start_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                    end_date: moment.tz(book.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                };
            });

            return res.status(200).json(formattedResult);

        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    });

    app.get('/booksByDate/:start_day/:start_month/:start_year/to/:end_day/:end_month/:end_year/',
        // app.auth.cdt, 
        async (req, res) => {
            try {
                const { start_day, start_month, start_year, end_day, end_month, end_year } = req.params;

                const formattedStartDate = moment(start_day + start_month + start_year, 'DDMMYYYY').format('YYYY-MM-DD');
                const formattedEndDate = moment(end_day + end_month + end_year, 'DDMMYYYY').format('YYYY-MM-DD');

                const startDateWithTimezone = moment.tz(formattedStartDate, 'YYYY-MM-DD', 'America/Sao_Paulo');
                const endDateWithTimezone = moment.tz(formattedEndDate, 'YYYY-MM-DD', 'America/Sao_Paulo');

                if (endDateWithTimezone < startDateWithTimezone) {
                    return res.status(400).json({ message: "A data de término deve ser maior que a data de início" });
                }
                let where = undefined;
                if (req.hasUser) {
                    // start_date ou end_date devem estar entre (startDateWithTimezone, endDateWithTimezone)e  deve ser user_responsible_id ou o user_executor_id
                    where = {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    { start_date: { [Op.between]: [startDateWithTimezone, endDateWithTimezone] } },
                                    { end_date: { [Op.between]: [startDateWithTimezone, endDateWithTimezone] } },
                                ]
                            },
                            {
                                [Op.or]:
                                    { user_responsible_id: req.userId, user_executor_id: req.userId },
                            }
                        ]
                    };
                } else {
                    where = {
                        [Op.or]: {
                            start_date: {
                                [Op.between]: [startDateWithTimezone, endDateWithTimezone]
                            },
                            end_date: {
                                [Op.between]: [startDateWithTimezone, endDateWithTimezone]
                            },

                        }
                    };
                }
                where.status = 'Pendente';

                const result = await app.models.books.findAll({
                    where,
                    include: [
                        {
                            model: app.models.versions,
                            include: [
                                {
                                    model: app.models.models
                                }
                            ]
                        },
                        {
                            model: app.models.equipaments
                        },
                        {
                            model: app.models.users,
                            as: 'user_responsible',
                            attributes: { exclude: ["password", "active", "ip"] }
                        },
                        {
                            model: app.models.users,
                            as: 'user_executor',
                            attributes: { exclude: ["password", "active", "ip"] }
                        }
                    ]
                });

                let addOneDay = result.map(book => {

                    let date = new Date(book.end_date)
                    let calendar_end_date = date.setDate(date.getDate() + 1)

                    return {
                        ...book.dataValues,
                        calendar_end_date: moment.tz(calendar_end_date, 'America/Sao_Paulo'),
                    };

                });

                const formattedResult = result.map(book => {
                    return {
                        ...book.dataValues,
                        start_date: moment.tz(book.start_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                        end_date: moment.tz(book.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                    };
                });


                return res.status(200).json(addOneDay);

            } catch (error) {
                console.log(error);
                return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
            }
        });

    app.get('/myReviews', app.auth.all, async (req, res) => {
        try {
            // const currentDate = moment().format('YYYY-MM-DD');
            const currentDate = new Date();
            const lastDay = currentDate.getDate() - 1
            currentDate.setDate(lastDay)
            const result = await app.models.books.findAll({
                where: {
                    user_responsible_id: req.userId,
                    status: "Pendente",
                    end_date: {
                        [Op.gte]: currentDate
                    }
                },
                include: [
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models,
                                include: [
                                    {
                                        model: app.models.categories
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: app.models.equipaments
                    },
                    {
                        model: app.models.users,
                        as: 'user_responsible',
                        attributes: { exclude: ["password", "active", "ip"] }
                    },
                    {
                        model: app.models.users,
                        as: 'user_executor',
                        attributes: { exclude: ["password", "active", "ip"] }
                    }
                ]
            });

            const formattedResult = result.map(book => {
                return {
                    ...book.dataValues,
                    start_date: moment.tz(book.start_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                    end_date: moment.tz(book.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                    version: book.version,
                    equipament: book.equipament
                };
            });

            return res.status(200).json(formattedResult);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    });

    app.patch('/book/:idBook', app.auth.cdt, async (req, res) => {
        try {
            const { user_responsible_id, user_executor_id, start_date, end_date, sgd } = req.body;
            const { idBook } = req.params;
            const formattedStartDate = moment(start_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
            const formattedEndDate = moment(end_date, 'DD/MM/YYYY').format('YYYY-MM-DD');

            const startDateWithTimezone = moment.tz(formattedStartDate, 'YYYY-MM-DD', 'America/Sao_Paulo');
            const endDateWithTimezone = moment.tz(formattedEndDate, 'YYYY-MM-DD', 'America/Sao_Paulo');

            if (endDateWithTimezone < startDateWithTimezone) {
                return res.status(400).json({ message: "A data de término deve ser maior que a data de início" });
            }

            const bookFind = await app.models.books.findByPk(idBook, {
                include: [
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models
                            }
                        ]
                    },
                    {
                        model: app.models.equipaments,
                    }
                ]
            })

            await bookFind.update({
                user_responsible_id: user_responsible_id,
                user_executor_id: user_executor_id,
                start_date: startDateWithTimezone,
                end_date: endDateWithTimezone,
                sgd: sgd,
            })

            app.log.register(app.log.actions.updateBook, req.userId,
                `"${req.user.name}" Alterou o caderno de testes "${bookFind.version.model.title} V${bookFind.version.version} ${bookFind.equipament.name}"`,
                { book_id: bookFind.id, user_executor_id: bookFind.user_executor_id, equipment_id: bookFind.equipament_id, model_id: bookFind.version.model_id, version_id: bookFind.version_id });


            return res.status(200).json({ message: "Caderno atualizado com sucesso!" })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
        }
    })

    app.patch('/bookStatus/:idBook', app.auth.cdt, async (req, res) => {
        try {
            const { status, end_date } = req.body;
            const { idBook } = req.params;

            const bookFind = await app.models.books.findByPk(idBook,
                {
                    include: [
                        {
                            model: app.models.versions,
                            include: [
                                {
                                    model: app.models.models
                                }
                            ]
                        },
                        {
                            model: app.models.equipaments,
                        }
                    ]
                }
            )

            await bookFind.update({
                status: status,
                end_date: new Date()
            })


            app.log.register(app.log.actions.updateStatus, req.userId,
                `"${req.user.name}" Alterou o status do caderno  de testes "${book.version.model.title} V${book.version.version} ${book.equipment.vendor} ${book.equipment.name}"  para "${status}"`,
                { book_id: book.id, user_executor_id: book.user_executor_id, equipment_id: book.equipament_id, model_id: book.version.model_id, version_id: book.version_id });

            return res.status(200).json({ message: "Caderno atualizado com sucesso!" })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
        }
    })

    app.get('/imprimirBook/:idBook', app.auth.all, async (req, res) => {
        try {
            const { idBook } = req.params;
            const bookResult = await app.models.books.findOne({
                where: {
                    id: idBook
                }
            });

            const versionBook = await app.models.versions.findOne({
                where: {
                    id: bookResult.version_id
                }
            });

            const result = {
                bookResult,
                versionBook: []
            };

            const features = await app.models.features.findAll({
                where: {
                    version_id: versionBook.id
                },
                order: [['order', 'ASC']],
                include: [
                    {
                        models: app.models.response_features,
                        where: {
                            book_id: idBook
                        },


                    }
                ]
            });
            const featuresAndResponses = []

            for (const feature of features) {
                const responseFeature = await app.models.response_features.findAll({
                    where: {
                        feature_id: feature.id
                    }
                });

                featuresAndResponses.push({
                    feature,
                    responseFeature
                })
            }

            const itemsInVersion = await app.models.items.findAll({
                where: {
                    version_id: versionBook.id,
                },
                order: [['order', 'ASC']],
            });

            const itemsWithFields = [];
            const fieldsWithResponses = [];

            for (const item of itemsInVersion) {
                const itemFields = await app.models.fields.findAll({
                    where: {
                        item_id: item.id,
                    },
                });

                for (const itemField of itemFields) {
                    const respons_fields = await app.models.response_fields.findAll({
                        where: {
                            field_id: itemField.id,
                        },
                    })

                    itemsWithFields.push({
                        item,
                        fields: itemFields,
                        response_fields: respons_fields
                    });
                };
            }
            result.versionBook.push({
                versionBook,
                features: featuresAndResponses,
                itemsInVersion: itemsWithFields
            });

            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    });

    app.get('/booksReviseds', app.auth.cdt, async (req, res) => {
        try {
            const todosBooks = await app.models.books.findAll({
                raw: true,
                nest: true,
                where: {
                    status: {
                        [Op.or]: ["Aprovado", "Suspenso", "Revogado"]
                    }
                },
                attributes: ["id",
                    "sgd",
                    "start_date",
                    "end_date",
                    "status",
                    "updatedAt",
                ],
                include: [
                    {
                        model: app.models.versions,
                        attributes: ['version'],
                        include: [
                            {
                                model: app.models.models,
                                attributes: ['title'],
                                include: [
                                    {
                                        attributes: ['name'],
                                        model: app.models.categories
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        model: app.models.equipaments
                    }
                ],
            });

            const [approved, suspensedOrRevoked] = await
                todosBooks.reduce(
                    ([approved, suspensedOrRevoked], book) => {
                        if (book.status === "Aprovado") {
                            approved.push(book);
                        } else if (book.status === "Suspenso" || book.status === "Revogado") {
                            suspensedOrRevoked.push(book);
                        }
                        return [approved, suspensedOrRevoked];
                    }, [[], []]
                )

            return res.status(200).json({ "Aprovados": approved, "Suspensos ou revogados": suspensedOrRevoked });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    })

    app.get('/assignBooks', app.auth.cdt, async (req, res) => {
        try {
            const result = await app.models.equipaments.findAll({
                where: {
                    active: true,
                },
                attributes: { exclude: ["active"] },
                order: [['name', 'ASC']]
            });

            const equipamentsAll = result.map(equipament => {
                if (equipament.endofsales) {
                    const formattedEndOfSales = moment.tz(equipament.endofsales, 'America/Sao_Paulo').format('DD/MM/YYYY');
                    return { ...equipament.dataValues, endofsales: formattedEndOfSales };
                }
                return equipament;
            });

            const modelsAll = await app.models.models.findAll({
                where: {
                    active: true,
                },
                order: [['title', 'ASC']],
            });
            const usersAll = await app.models.users.findAll({
                where: {
                    active: true,
                },
                attributes: { exclude: ["password", "active", "ip"] },
                order: [['name', 'ASC']]
            });

            return res.status(200).json({
                users: usersAll,
                models: modelsAll,
                equipaments: equipamentsAll
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    })

    app.put('/books/:id/status', app.auth.cdt, async (req, res) => {
            try {
                const bookId = req.params.id;
                const book = await app.models.books.findByPk(bookId);
    
                if (!book) {
                    return res.status(404).json({ message: "Livro não encontrado" });
                }
    
                let newStatus;
               
                switch (book.status) {
                    case "Aprovado":
                    case "Reprovado":
                        newStatus = 'Pendente';
                        break;
                    case "Revogado":
                        if (req.body.newStatus === 'Reprovado') {
                            newStatus = 'Pendente';
                        } else {
                            newStatus = 'Reprovado';
                        }
                        break;
                    case "Pendente":
                        newStatus = req.body.newStatus || 'Pendente';
                        break;
                    default:
                        return res.status(400).json({
                            message: `Status não alterado. Status atual: '${book.status}'`,
                            book
                        });
                }
               
    
                book.status = newStatus;
    
                if (newStatus === 'Pendente') {
                        book.status = 'Pendente';
                        book.user_responsible_id = req.user.id;
                        book.user_responsible_id = req.user.id;
                        await book.save();
                    }
               
    
                const features = await app.models.response_features.findAll({ where: { book_id: bookId } });
                await Promise.all(features.map(async (feature) => {
                    feature.status = 'Aguardando envio para revisão';
                    await feature.save();
               
                }));
               
               
                const items = await app.models.response_items.findAll({
                    where: {
                        book_id: bookId
                    }
                });
                await Promise.all(items.map(async (item) => {
                    item.status = 'Aguardando envio para revisão';
                    await item.save();
                }));
    
                return res.status(200).json({ message: `Status alterado para '${book.status}'`, book, user_responsible_id: book.user_responsible_id,
                    user_executor_id: book.user_executor_id});
            } catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Ocorreu um erro ao processar sua solicitação" });
            }
        })
}

