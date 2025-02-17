const moment = require('moment-timezone');
const tag_associations = require('../models/tag_associations');
module.exports = (app) => {
    const jwt = app.auth;
    const Books = app.models.books;
    const StatusBook = app.models.statusBook;
    const Users = app.models.users;
    const Versions = app.models.versions;
    const Features = app.models.features;
    const Items = app.models.items;
    const Models = app.models.models;
    const Categories = app.models.categories;
    const Equipaments = app.models.equipaments;
    const Response_features = app.models.response_features;
    const Response_items = app.models.response_items;
    const Response_fields = app.models.response_fields;
    const Correction_fields = app.models.correction_fields;
    const Image = app.models.images;
    const Fields = app.models.fields;
    const TypeFieldValues = app.models.type_fields_values;
    const TypeField = app.models.type_fields;
    const Moment = require('moment-timezone');
    const { Op, Association } = require('sequelize');
    const Tags = app.models.tags;
    const TagAssociations = app.models.tag_associations;

    app.get('/portal',
        // app.auth.cdt, 
        async (req, res) => {
            try {
                let cadernos = await Books.findAll({
                    where: {
                        status: {
                            [Op.not]: ["Pendente", "Cancelado"]
                        }
                    },
                    include: [
                        {
                            model: Versions,
                            include: [
                                {
                                    model: Models,
                                    include: [
                                        {
                                            model: Categories
                                        }]
                                },
                            ]
                        },
                        {
                            model: Equipaments,
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                });


                cadernos = cadernos.map((bk) => bk.toJSON());
                let portalData = [];
                const equip = {};

                for (const bk of cadernos) {
                    if (!(bk.equipament.id in equip)) {
                        equip[bk.equipament.id] = {};
                    }
                    // verificar se tem esse modelo no equipamento,
                    // caso exista verifica se a data do book e a mais antiga, se for mais antiga então não adiciona
                    if (!(bk.version.model.category.id in equip[bk.equipament.id])) {
                        equip[bk.equipament.id][bk.version.model.category.id] = bk;
                }
            }
                for (const equipament of Object.values(equip)) {
                    for (const caderno of Object.values(equipament)) {
                        // const status = await statusBook.findOne({ where: { idBook: data.id } })
                        portalData.push({
                            "idEquip": caderno.equipament.id,
                            "idBook": caderno.id,
                            "idVersion": caderno.version.id,
                            "idModel": caderno.version.model.id,
                            "status": caderno.status,
                            "vendor": caderno.equipament.vendor,
                            "name": caderno.equipament.name,
                            // "comment": status,
                            "titleBook": caderno.version.model.title,
                            "category": caderno.version.model.category.name,
                            "end_date": moment.tz(caderno.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                            "sap": caderno.equipament.sap,
                        })
                    }
                }
                return res.status(200).json(portalData);
            } catch (error) {
                console.log(error);
                return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
            }
        })

    app.get('/portal/book/:idBook',
        // app.auth.cdt, 
        async (req, res) => {
            try {
                const { idBook } = req.params;
                const book = await app.models.books.findByPk(idBook, {
                    attributes: ["sgd", "status", "end_date"],
                    include: [
                        {
                            model: app.models.versions,
                            attributes: ["version"],
                            include: [
                                {
                                    model: app.models.models,
                                    attributes: ["title"],
                                    include: [
                                        {
                                            model: app.models.categories,
                                            attributes: ["name"]
                                        }
                                    ]
                                },
                                {
                                    model: Items,
                                    as: "versionItems",
                                    where: {
                                        fillable: true
                                    },
                                    attributes: ["title"],
                                    include: [
                                        {
                                            model: Response_items,
                                            attributes: ["status"],
                                            where: {
                                                book_id: idBook
                                            }
                                        }
                                    ]
                                },
                                {
                                    model: Features,
                                    as: "versionDetails",
                                    attributes: ['name'],
                                    include: [
                                        {
                                            model: Response_features,
                                            attributes: ["response"],
                                            where: {
                                                book_id: idBook
                                            }
                                        }
                                    ]
                                }

                            ]

                        },
                        {
                            model: Equipaments,
                            attributes: ["id", "name", "vendor", "price", "endofsales", "sap"],
                            include: [
                                {
                                    model: Image,
                                    attributes: ["path"],
                                    order: [['createdAt', 'DESC']],
                                }
                            ]
                        }
                    ],
                });
                if (!book) {
                    return res.status(404).json({ message: "Caderno não encontrado" })
                }

                const statics = {
                    equipment_id: book.equipament.id,
                    equipment: book.equipament.name,
                    equipment_sap: book.equipament.sap,
                    vendor: book.equipament.vendor,
                    model: book.version.model.title,
                    modelVersion: book.version.version,
                    category: book.version.model.category.name,
                    image: book.equipament.images.length > 0 ? book.equipament.images[book.equipament.images.length - 1].path : 'uploads/default.png',
                    status: book.status,
                    sgd: book.sgd,
                    price: book.equipament.price,
                    endOfSales: book.equipament.endofsales || "Não previsto",
                    certifiedDate: moment.tz(book.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                    sap: book.equipament.sap,

                }
                const features = {}
                for (const feature of book.version.versionDetails) {
                    if (feature.response_features.length === 0) {
                        testResume[test.title] = 'Não avaliado'
                        continue;
                    }
                    features[feature.name] = feature.response_features[0].response
                }
                const testResume = {}
                for (const test of book.version.versionItems) {
                    if (test.response_items.length === 0) {
                        testResume[test.title] = 'Não avaliado'
                        continue;
                    }
                    testResume[test.title] = test.response_items[0].status == 'Aprovado'
                }
                return res.status(200).json({ statics, features, testResume })

            } catch (error) {
                console.log(error);
                return res.status(400).json({ message: error.message })
            }
        });

    app.get('/debugBooks/:idBook', async (req, res) => {
        const { idBook } = req.params;  
        try {
            const book = await Books.findByPk(idBook, {
                attributes: ["id","sgd", "status", "end_date"],
                include: [
                    {                       
                        model: Versions,
                        attributes: ["id","version"],
                        include: [
                            {
                                model: Models,
                                attributes: ["id","title"],
                                include: [
                                    {
                                        model: Categories,
                                        attributes: ["name"]
                                    }
                                ],
                            },
                            {
                                model: Items,
                                as: "versionItems",
                                attributes: ["title"],
                                include:[
                                    {
                                        model: Response_items,
                                        // attributes: ["status"],
                                        // where: {
                                        //     book_id: idBook
                                        // }
                                    }
                                ]
                            },
                            {
                                model: Features,
                                as: "versionDetails",
                                include:[
                                    {
                                        model: Response_features
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: Equipaments,
                        include: [
                            {
                                model: Image
                            }
                        ]
                    }
                ]
            })
              
        
            return res.status(200).json(book);
        }
        catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    })

    app.get('/recentBooks', async (req, res) => {
        // app.auth.cdt,
        try {
            let { limit } = req.query;// pega o valor depois de /rota?
            limit = parseInt(limit);
            if (!limit || limit <= 0) {
                limit = 5;

            }

            const recentBooks = await Books.findAll({
                where: { status: "Aprovado" },
                limit,
                order: [['updatedAt', 'DESC']],
            });
            if (!recentBooks) {
                return res.status(404).json({ message: "Caderno não encontrado" })
            }

            const books = await Promise.all(recentBooks.map(async (tbook) => {
                const idBook = tbook.id;
                const book = await app.models.books.findByPk(idBook, {
                    attributes: ["id","sgd", "status", "end_date"],
                    include: [
                        {
                            model: Versions,
                            attributes: ["id","version"],
                            include: [
                                {
                                    model: Models,
                                    attributes: ["id","title"],
                                    include: [
                                        {
                                            model: Categories,
                                            attributes: ["name"]
                                        }
                                    ]
                                },
                                {
                                    model: Items,
                                    as: "versionItems",
                                    // where: {
                                    //     fillable: true
                                    // },
                                    // attributes: ["title"],
                                    include: [
                                        {
                                            model: Response_items,
                                            //attributes: ["status"],
                                            // where: {
                                            //     book_id: idBook
                                            // }
                                        }
                                    ]
                                },
                                {
                                    model: Features,
                                    as: "versionDetails",
                                    attributes: ['name'],
                                    include: [
                                        {
                                            model: Response_features,
                                            attributes: ["response"],
                                            // where: {
                                            //     book_id: idBook
                                            // }
                                        }
                                    ]
                                }

                            ]

                        },
                        {
                            model: Equipaments,
                            attributes: ["id", "name", "vendor", "price", "endofsales", "sap"],
                            include: [
                                {
                                    model: Image,
                                    attributes: ["path"],
                                    order: [['createdAt', 'DESC']],
                                }
                            ]
                        }
                    ],
                });
                if (!book) {
                    return res.status(404).json({ message: "Caderno não encontrado" })
                }
                const statics = {
                    equipment_id: book.equipament.id,
                    equipment: book.equipament.name,
                    sap: book.equipament.sap,
                    vendor: book.equipament.vendor,
                    model: book.version.model.title,
                    modelVersion: book.version.version,
                    category: book.version.model.category.name,
                    image: book.equipament.images.length > 0 ? book.equipament.images[book.equipament.images.length - 1].path : 'uploads/default.png',
                    status: book.status,
                    sgd: book.sgd,
                    price: book.equipament.price,
                    endOfSales: book.equipament.endofsales || "Não previsto",
                    certifiedDate: moment.tz(book.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY')
                }
                const features = {}
                for (const feature of book.version.versionDetails) {
                    if (feature.response_features.length === 0) {
                        testResume[test.title] = 'Não avaliado'
                        continue;
                    }
                    features[feature.name] = feature.response_features[0].response
                }
                const testResume = {}
                for (const test of book.version.versionItems) {
                    if (test.response_items.length === 0) {
                        testResume[test.title] = 'Não avaliado'
                        continue;
                    }
                    for (const r of test.response_items){
                        
                        if (r.book_id === idBook) {
                            testResume[test.title] = r.status
                        }
                    }
                    //testResume[test.title] = test.response_items.status
                }
                return { statics, features, testResume }
            }));

            return res.status(200).json(books);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    });


    app.post('/addVersion/:book_id',
        // app.auth.cdt, 
        async (req, res) => {
            try {
                const { book_id } = req.params;
                const { version } = req.body;

                const book = await app.models.books.findByPk(book_id, {
                    include: [{
                        model: app.models.versions,
                        include: [{
                            model: app.models.features,
                            as: versionDetails,
                            include: [{
                                model: app.models.response_features,
                                where: {
                                    book_id: book_id
                                }
                            }]
                        }]
                    }]
                });
                console.log(book);
            } catch (error) {
                return res.status(400).json({ message: error.message })
            }
        })

     app.get('/tags/book/:idBook', app.auth.cdt, async (req, res) => {
            try {
                const { idBook } = req.params;
        
                const book = await app.models.books.findByPk(idBook, {
                    attributes: ['equipament_id'],
                });
        
                if (!book) {
                    return res.status(404).json({ message: 'Caderno não encontrado' })
                }
        
                const equipamentId = book.equipament_id;
                console.log('Equipament ID:', equipamentId);

        
                const tagAssociations = await TagAssociations.findAll({
                    where: { equipament_id: equipamentId },
                    attributes: ['tag_id']
                });

                console.log('Tag Associations:', tagAssociations);

                if (tagAssociations.length === 0) {
                    return res.status(404).json({ message: "Nenhuma tag encontrada para esse equipamento" });
                }
        
                const tagIds = [];
                for (let i = 0; i < tagAssociations.length; i++){
                    tagIds.push(tagAssociations[i].tag_id)
                }
                console.log('Tag IDs:', tagIds);

        
                const tags = await Tags.findAll({
                    where: {
                        id: {
                            [Op.in]: tagIds
                        }
                    },
                    attributes: ['name', 'associated_categories'],
                });
                console.log('Tags:', tags);

        
                return res.status(200).json(tags);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Ocorreu um erro ao processar sua solicitação' })
        
            }
        
        })

        app.post('/tags/associate', app.auth.cdt, async (req, res) =>{
            try{
                const { equipament_id, tag_id } = req.body;

                if (!equipament_id || !tag_id) {
                    return res.status(400).json({ message: 'equipament_id e tag_id são obrigatórios' });
                }
                
                const equipament = await Equipaments.findByPk(equipament_id);
                if (!equipament) {
                    return res.status(404).json({ message: 'Equipamento não encontrado' })
                }

                const tag = await Tags.findByPk(tag_id);
                if (!tag){
                    return res.status(404).json({ message: 'Tag não encontrada' })
                }

                const newAssociation = await TagAssociations.create({
                    equipament_id,
                    tag_id

                })
                
                return res.status(201).json(newAssociation);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Ocorreu um erro ao processar sua solicitação '})
            }
        })
    
};
