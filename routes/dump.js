module.exports = (app) => {
    const fs = require('fs');
    const { exec } = require('child_process');
    const config = require('../config');
    const Moment = require('moment-timezone');
    const { Op, Sequelize } = require('sequelize');

    const util = require('util');
    const execPromise = util.promisify(exec);

    const isObjectEmpty = (obj) => obj && Object.keys(obj).length === 0;
    const validateAtributes = (obj, attributes, prename = '', end = '') => {
        for (const attribute of Object.keys(attributes)) {
            const type = attributes[attribute];

            switch (type) {
                case 'string':
                    if (!obj[attribute]) {
                        throw new Error(`O atributo ${prename}${attribute} é uma string obrigatória${end}`)
                    }
                    break;
                case 'number':
                    if (obj[attribute] === undefined || isNaN(obj[attribute])) {
                        throw new Error(`O atributo ${prename}${attribute} é um número obrigatório${end}`)
                    }
                    break;

                case 'boolean':
                    if (obj[attribute] !== true && obj[attribute] !== false) {
                        throw new Error(`O atributo ${prename}${attribute} é um booleano obrigatório${end}`)
                    }
                    break;
                default:

                    break;
            }
        }

    }
    const dumpVersion = async (version_id, with_id = false) => {
        const item_attributes = ['title', 'description', 'order', 'fillable'];
        const feature_attributes = ['name', 'order'];
        const field_attributes = ['title_field', 'standard_value', 'order_field', 'type_field_id'];
        if (with_id) {
            item_attributes.push('id');
            feature_attributes.push('id');
            field_attributes.push('id');
            field_attributes.push('type_field_id');
        }

        const features = await app.models.features.findAll({
            where: { version_id: version_id, is_variable: false },
            order: [['order', 'ASC']]
        });
        let type_fields = {};
        for (const tfild of await app.models.type_fields.findAll()) {
            type_fields[tfild.id] = tfild.tag;
        }

        // get all items
        const items = JSON.parse(JSON.stringify(await app.models.items.findAll({
            where: { version_id: version_id },
            order: [['order', 'ASC']],
            attributes: item_attributes,
            include: [{
                model: app.models.fields,
                attributes: field_attributes,
                include: [{
                    model: app.models.features,
                    attributes: feature_attributes
                }]
            }]
        })));

        const allFeatures = features.map((feature) => {
            return feature;
        });
        // tem 1 feature (não variavel)
        for (const i in items) {
            // items[i] = items[i].get({ plain: true });
            for (const j in items[i].fields) {
                const field = items[i].fields[j];
                if (field.feature) {
                    allFeatures.push(field.feature)
                }
                field.order_field = j;
                field.tag = type_fields[field.type_field_id];
                if (!with_id) {
                    field.type_field_id = undefined;
                }

            }
            items[i].order = i;
        }

        // tem 4 features , 1 não variavel e 3 variaveis
        allFeatures.sort((a, b) => a.order - b.order);
        for (const i in allFeatures) {
            allFeatures[i].order = i;
        }
        return { items, features };
    }

    app.get('/dump/model/:idModel', app.auth.cdt, async (req, res) => {
        try {
            // get last version of model
            const { idModel } = req.params;
            const version = await app.models.versions.findOne({
                where: { model_id: idModel },
                order: [['version', 'DESC']]
            });
            if (!version) { return res.status(400).json({ message: "Nenhuma versão encontrada" }); }
            // get all features
            const dump = await dumpVersion(version.id);
            return res.status(200).json(dump)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: error.message })
        }
    })




    app.post('/dump/model/:idModel', app.auth.cdt, async (req, res) => {
        try {
            const { idModel } = req.params;
            const { items, features } = req.body;
            const version = await app.models.versions.findOne({
                where: { model_id: idModel },
                order: [['id', 'DESC']]
            });

            if (!version) {
                return res.status(400).json({ message: "Nenhuma versão encontrada" });
            }

            if (version.concluded) {
                return res.status(400).json({ message: "Não pode ser exportado para uma Versão concluída" });
            }

            const currentItens = await app.models.items.findAll({ where: { version_id: version.id } });
            const currentFeatures = await app.models.features.findAll({ where: { version_id: version.id } });

            let type_fields = {};
            for (const tfild of await app.models.type_fields.findAll()) {
                type_fields[tfild.tag] = tfild.id;
            }


            let lastOrderItem = currentItens.length;
            let lastOrderFeature = currentFeatures.length;

            // ordena pela ordem
            items.sort((a, b) => a.order - b.order);
            features.sort((a, b) => a.order - b.order);


            // etapa de validação para não quebrar durante a criação
            features.forEach(feature => {
                validateAtributes(feature, { name: 'string', is_variable: 'boolean', 'order': 'number' }, '', ' para as features');
            });

            // cria os itens
            for (const item of items) {
                validateAtributes(item, { title: 'string', description: 'string', fillable: 'boolean' });
                for (const field of item.fields) {
                    validateAtributes(field, { standard_value: 'string_null', tag: 'string', 'order_field': 'number' }, '', ' para os fields');
                    if (field.feature) {
                        validateAtributes(field.feature, { name: 'string', 'order': 'number' });
                    }
                    if (!(field.tag in type_fields)) {
                        throw new Error(`Tag ${field.tag} inexistente`)
                    }
                }
            }
            // dados validados
            // cria as features
            for (const feature of features) {
                await app.models.features.create({
                    name: feature.name,
                    is_variable: false,
                    order: +feature.order + lastOrderFeature,
                    version_id: version.id
                });
            }


            // criar os itens
            for (const item of items) {
                const new_item = await app.models.items.create({
                    title: item.title,
                    description: item.description,
                    fillable: item.fillable,
                    version_id: version.id,
                    order: +item.order + lastOrderItem
                });

                // criar os fields
                for (const field of item.fields) {
                    // prepara o field
                    const newField = {
                        title_field: field.title_field,
                        standard_value: field.standard_value,
                        type_field_id: type_fields[field.tag],
                        order_field: field.order_field,
                        item_id: new_item.id
                    }
                    // cria a feature 
                    if (field.feature) {
                        const newFeature = await app.models.features.create({
                            name: field.feature.name,
                            is_variable: true,
                            order: +field.feature.order + lastOrderFeature,
                            version_id: version.id
                        })
                        newField.feature_id = newFeature.id;
                    }
                    await app.models.fields.create(newField);
                }
            }
            return res.status(200).json({ message: "Caderno carregado com sucesso" })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: error.message })
        }
    });

    app.get('/dump', app.auth.cdt, async (req, res) => {
        try {
            
            const timestamp = Moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH.mm.ss');
            const filePath = `dumps/${timestamp}.sql`;
            await execPromise(`mysqldump -u ${config.db.username} -p${config.db.password} ${config.db.database} > "${filePath}"`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            res.setHeader('Content-Disposition', `attachment; filename=${timestamp}.sql`);
            return res.status(200).download(filePath);
            /*
            const timestamp = Moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH.mm.ss');
            let filePath = `dumps/${timestamp}`;
            await execPromise(`mysqldump -u ${config.db.username} -p${config.db.password} ${config.db.database} > "${filePath}.sql"`);
            await execPromise(`zip -r -P  cdt "${filePath}.zip" /var/www/uploads "${filePath}.sql"`);
            await execPromise(`rm -f "${filePath}.sql"`);
            // filePath = 'dumps/2024-10-04 18.42.12';
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Length', fs.statSync(`${filePath}.zip`).size);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            res.setHeader('Content-Disposition', `attachment; filename=${timestamp}.zip`);
            return res.sendFile(`/var/www/${filePath}.zip`, (e) => {
                if (e) {
                    console.log(e)
                    res.status(400).json({ message: e.message })
                }
                console.log('Download concluído')
            });*/
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: error.message })
        }
    })
}
