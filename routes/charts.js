module.exports = (app) => {
    // const jwt = app.auth;
    const moment = require('moment-timezone');
    const { Op } = require('sequelize');
    const { Sequelize } = require("sequelize");

    app.get('/charts/byCategory/', 
        // jwt.hasUser, 
        // app.auth.cdt, 
        async (req, res) => {
        try {
            let { start, end, userId } = req.query;
            start = start ? parseInt(start, 10) : 0;
            end = end ? parseInt(end, 10) : new Date().getTime();

            const where = {
                start_date: {
                    [Op.gte]: start
                },
                end_date: {
                    [Op.lte]: end
                }
            }
            if (userId) {
                where['user_responsible_id'] = userId;
            }

            const categorias = await app.models.categories.findAll({
                include: [{
                    model: app.models.models,
                    include: [
                        { model: app.models.versions }
                    ]
                }]
            });


            const formated = await Promise.all(categorias.map(async (category) => {
                const series = [{ name: 'Aprovado', value: 0 }, { name: 'Reprovado', value: 0 }, { name: 'Suspenso', value: 0 }, { name: 'Revogado', value: 0 }]
                let total = 0;
                for (const serie of series) {
                    where['status'] = serie.name
                    for (const model of category.models) {
                        for (const version of model.versions) {
                            where.version_id = version.id
                            const books = await app.models.books.count({
                                where
                            })
                            if (books > 0) {
                                serie.value += books
                                total += books
                            }
                        }
                    }
                }
                return {
                    name: category.name,
                    series,
                    total
                }
            }));
            formated.sort((a, b) => b.total - a.total)
            return res.status(200).json(formated)
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                message: "Ocorreu um erro para processar sua solicitação"
            });
        }
    });

    app.get('/charts/byModel', 
        // jwt.hasUser, 
        // app.auth.cdt, 
        async (req, res) => {
        try {
            let { start, end, userId } = req.query;
            start = start ? parseInt(start, 10) : 0;
            end = end ? parseInt(end, 10) : new Date().getTime();
            const where = {
                start_date: {
                    [Op.gte]: start
                },
                end_date: {
                    [Op.lte]: end
                }
            }
            if (userId) {
                where['user_responsible_id'] = userId;
            }
            const models = await app.models.models.findAll({
                attributes: ['title', 'id'],
                include: [
                    {
                        model: app.models.versions,
                        attributes: ['id'],
                    }
                ]
            })
            const formated = await Promise.all(models.map(async (model) => {
                const series = [{ name: 'Aprovado', value: 0 }, { name: 'Reprovado', value: 0 }, { name: 'Suspenso', value: 0 }, { name: 'Revogado', value: 0 }]
                let total = 0;

                for (const serie of series) {
                    where['status'] = serie.name
                    for (const version of model.versions) {
                        where.version_id = version.id
                        const books = await app.models.books.count({
                            where
                        })
                        if (books > 0) {
                            serie.value += books
                            total += books
                        }
                    }
                }

                return {
                    name: model.title,
                    series,
                    total
                }
            }))
            formated.sort((a, b) => b.total - a.total)
            return res.status(200).json(formated)

        } catch (e) {
            console.error(e);
            return res.status(400).json({
                message: "Ocorreu um erro para processar sua solicitação"
            });
        }
    });

    app.get('/charts/byBook', 
        // jwt.hasUser, 
        // app.auth.cdt,
        async (req, res) => {
        try {
            let { start, end, userId } = req.query;
            start = start ? parseInt(start, 10) : 0;
            end = end ? parseInt(end, 10) : new Date().getTime();
            const where = {
                start_date: {
                    [Op.gte]: start
                },
                end_date: {
                    [Op.lte]: end
                }
            }
            if (userId) {
                where['user_responsible_id'] = userId;
            }

            const series = [{ name: 'Aprovado', value: 0 }, { name: 'Reprovado', value: 0 }, { name: 'Suspenso', value: 0 }, { name: 'Revogado', value: 0 }]

            const formated = await Promise.all(series.map(async serie => {
                where['status'] = serie.name
                const books = await app.models.books.count({
                    where
                })
                if (books > 0) {
                    serie.value += books
                }
                return {
                    name: serie.name,
                    value: serie.value,
                }
            }))
            return res.status(200).json(formated)
        } catch (e) {
            console.error(e);
            return res.status(400).json({
                message: "Ocorreu um erro para processar sua solicitação"
            });
        }
    });

    app.get('/charts/byBookInExecution/', 
        // jwt.hasUser, 
        // app.auth.cdt,
        async (req, res) => {
        try {
            // filtrar todos os cadernos com status Pendente
            // para cada caderno retonar a quantidade de testes para cada status


            let { userId } = req.query;

            let cadernos;
            userId = parseInt(userId);
            if (userId && req.hasUser && req.userProfile == 'cdt') {
                cadernos = await app.models.books.findAll({
                    where: { status: 'Pendente', 'user_responsible_id': userId },
                    include: [
                        {
                            model: app.models.equipaments
                        },
                        {
                            model: app.models.versions,
                            include: [
                                { model: app.models.models }
                            ]
                        },

                    ]
                })

            } else {
                cadernos = await app.models.books.findAll({
                    where: { status: 'Pendente' },
                    include: [
                        {
                            model: app.models.equipaments
                        },
                        {
                            model: app.models.versions,
                            include: [
                                { model: app.models.models }
                            ]

                        }

                    ]

                })
            }

            const resumo = await Promise.all(cadernos.map(async (caderno) => {

                // status = 'Aguardando envio para revisão'
                // status = 'Salvo'
                // status = 'Em revisão'
                // status = 'Reprovado'
                // status = 'Aprovado'
                // Criar um objeto no formato 
                /*
                                {
                                    "name": "Nome do caderno",
                                    "series": [
                                        { "name": "Aguardando envio para revisão", "value": 65 },
                                        { "name": "Salvo", "value": 15 },
                                        { "name": "Em revisão", "value": 0 },
                                        { "name": "Reprovado", "value": 3 }],
                                        { "name": "Aprovado", "value": 3 }],
                                    "total": 83
                                }
                */

                const obj = {
                    //name = model.title + v + version.veriosn + eq.vendor + eq.name
                    name: `${caderno.version.model.title} v${caderno.version.version} ${caderno.equipament.vendor} ${caderno.equipament.name}`,
                    series: [
                        { "name": "Aguardando envio para revisão", "value": 0 },
                        { "name": "Salvo", "value": 0 },
                        { "name": "Em revisão", "value": 0 },
                        { "name": "Reprovado", "value": 0 },
                        { "name": "Aprovado", "value": 0 }]

                }

                for (const serie of obj.series) {
                    serie.value = await app.models.response_items.count({ where: { book_id: caderno.id, status: serie.name } })
                }
                return obj;

            })
            );


            return res.json(resumo);



        } catch (e) {
            console.error(e);
            return res.status(400).json({
                message: "Ocorreu um erro para processar sua solicitação"
            });
        }
    });
};
