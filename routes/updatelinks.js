const { where } = require("sequelize");
const { Op } = require('sequelize');
//Районы кварталы

module.exports = (app) => {
    const response_fields = app.models.response_fields;
    //fk in response_items and fields
    const response_items = app.models.response_items;
        //fk in books and items (no need books)
    const fields = app.models.fields;
        //fk in items
    const items = app.models.items;
    const books = app.models.books;
            //fk in versions and equipaments
    const equipaments = app.models.equipaments;
    const versions = app.models.versions;
                //fk in models
    const models = app.models.models;
                    //fk in categories
    const categories = app.models.categories;
    const jwt = app.auth;

    app.get("/oldLinks", jwt.cdt, async (req, res) => {
        const substring = "https://algarnet.sharepoint.com/:f:/r/sites/1-SERVICETRANSITIONPublico/Documentos%20Compartilhados/General/7-%20HOMOLOGA%C3%87%C3%83O"
        try {
            const result = await response_fields.findAll({
                where: {
                    response: {
                        [Op.like]: `%${substring}%`,
                    }, 
                },
                attributes: ['id', 'response', 'field_id', 'response_item_id'], 
                include: [
                    {
                        model: response_items,
                        attributes: ['book_id', 'item_id'],
                        include: [
                            {
                                model: items,
                                attributes: ['title', 'version_id'],
                            },
                            {
                                model: books,
                                attributes: ['version_id', 'equipament_id'],
                                include: [
                                    {
                                        model: equipaments,
                                        attributes: ['name', 'vendor']
                                    },
                                    {
                                        model: versions,
                                        attributes: ['model_id'],
                                        include: [
                                            {
                                                model: models,
                                                attributes: ['title', 'category_id'],
                                                include: [
                                                    {
                                                        model: categories,
                                                        attributes: ['name']

                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
            });
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitaçãoo"})
        }
    });
}