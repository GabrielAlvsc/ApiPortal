const { version } = require("moment");
const equipaments = require("../models/equipaments");

module.exports = (app) => {
    const jwt = app.auth;
    const tags = app.models.tags;
    const { Op } = require('sequelize');
    // const { where } = require("sequelize");

    app.get('/tags', jwt.all, async (req, res) => {
        try {
            const result = await tags.findAll({
                attributes: { exclude: ["createdAt", "updatedAt"] },
            });
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    });

    app.get("/tags/:categoriesId", jwt.cdt, async (req, res) => {
        try {
            const { categoriesId } = req.params;
            const result = await tags.findAll(
                {
                    attributes: { exclude: ["createdAt", "updatedAt"] },
                    where: { associated_categories: categoriesId }
                })
            if (!result) {
                return res.status(404).json({ message: "Tag não encontrada" })
            }
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }

    })


    app.post('/tags', app.auth.cdt, async (req, res) => {

        const { name, id, associeted_categories } = req.body;

        try {
            const tagName = await app.models.tags.findOne({ where: name })
            //verifica se há uma tag name existente 
            if (tagName) {
                return res.status(200).json({ message: "Já existe uma Tag com esse nome" });
            }
            //se a tag não existir, cria uma nova tag com os dados fornecidos(name, id, associeted_categories)
            const newTag = await app.models.tags.create({
                name,
                id,
                associeted_categories
            });

            return res.status(200).json(newTag)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar a sua solicitação!" })
        }

    })


    app.get('/vendors/:categoryId', app.auth.cdt, async (req, res) => {
        
        const { categoryId } = req.params;

        try {
            //Busca pela categoria
            const models = await app.models.models.findAll({
                where: { category_Id: categoryId },
                attributes: ['id']
            })

            if (models.length === 0) {
                return res.status(404).json({ message: "Nenhum modelo encontrado para essa categoria." })
            }
            const modelIds = models.map(model => model.id);



            //Busca as versões pelos modelos
            const versions = await app.models.versions.findAll({
                where: {model_id: {[Op.in]: modelIds} },
                attributes: ['id']
            })

            if (versions.length === 0){
                return res.status(400).json({message: "Nenhuma versão encontrada para esse modelo." })
            }
            const versionIds = versions.map(book => book.id);



            //Busca equipamentos pelos cadernos
            const books = await app.models.books.findAll({
                where: { version_id: {[Op.in]: versionIds}},
                attributes: ['equipament_id']
            })

            if (books.length === 0) {
                return res.status(400).json({ message: "Nenhuma versão encontrada para esse equipamento." })
            };

             const equipamentIds = books.map(book => book.equipament_id);



            //Busca vendors pelos equipamentos
            const equipaments = await app.models.equipaments.findAll({
               where: { id: { [Op.in]: equipamentIds} },
               attributes: ['vendor']

            });
            if (equipaments.length === 0) {
                return res.status(404).json({ message: "Nenhum equipamento encontrado para esse caderno." })
            }

            const vendors = equipaments.map(equipaments => equipaments.vendor);
            return res.status(200).json({ vendors });

        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar a sua solicitação!" })
        }
    });


    app.post('/tags/:tag_associations', app.auth.cdt, async (req, res) => {
    try{
            const{id, equipament_id, tag_id} = req.body;
            

            if(!equipament_id || !tag_id){
                return res.status(400).json({message: 'equipamento e tag são obrigatórios' })
            }

            const newTagAssociations = await app.models.tag_associations.create({
                id, 
                equipament_id,  
                tag_id
            })
        res.status(200).json(newTagAssociations)
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Erro ao criar associaçao de tags' })
    }
    })



    app.patch('/tags/:id', app.auth.cdt, async(req, res) =>{
        try{
            const{id, equipament_id, tag_id} = req.body;


            const updateTagAssociations = await app.models.tag_associations.update(
                {equipament_id, tag_id},
                {where: {id}}
            );
            if (updateTagAssociations[0] == 0){
                return res.status(404).json({message: 'Associação de tags não encontrada' })
            }
            res.status(200).json({message: 'Associação de tags atualizada com sucesso!' })
        }catch (error) {
            console.error(error)
            res.status(500).json({message:'Erro ao atualizar associação de tags' })
        }
    })

    app.delete('/tags/:id', app.auth.cdt, async(req, res) =>{
        try{
            const { id } = req.params;

            const deleteTagAssociation = await app.models.tag_associations.destroy({
                where: {id}
            })
            if (deleteTagAssociation === 0){
                return res.status(404).json({ message: 'Associação de tags não encotrada!' });
            }
            res.status(200).json({message:'Associação de tags deletada com sucesso!' });
        }catch (error){ 
            console.error(error)
            res.status(500).json({message: 'Erro ao deletar associação de tags!' })
        }
    })
}