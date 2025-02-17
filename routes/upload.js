const path = require('path');

const maxSize = 50;
const maxSizeBytes = maxSize * 1024 * 1024;

module.exports = (app) => {
    const { Op } = require('sequelize');
    const multer = require('multer');
    const crypto = require('crypto');
    const fs = require('fs');

    const jwt = app.auth;
    var order = 1

    const getImagePath = file => {
        return `/${file.path}`;
    }
    const checkSize = async (req, res, next) => {
        const fileSize = req.headers['content-length'];
        if (fileSize > maxSizeBytes) {
            return res.status(400).send({ message: `Arquivo muito grande! Tamanho maximo: ${maxSize}MB, tamanho do arquivo enviado: ${parseInt(fileSize / 1024 / 1024)}` });
        }
        next();
    }

    const storageFileName = (req, file, cb) => {
        const extension = path.extname(file.originalname) || '.jpg';
        const filename = Date.now() + '-' + order + extension;
        order++;
        cb(null, filename);
    }

    const uploadEquipmentImages = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/equipments/'); // Diretório onde os arquivos serão salvos
            },
            filename: storageFileName
        })
    });
    const uploadItemImages = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/models/'); // Diretório onde os arquivos serão salvos
            },
            filename: storageFileName
        })
    });
    const uploadEvidenceImages = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/evidences/'); // Diretório onde os arquivos serão salvos
            },
            filename: storageFileName
        })
    });

    // Função para calcular o hash de um arquivo
    const calculateHash = (filePath) => {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);

            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', (err) => reject(err));
        });
    };

    app.post('/uploadEquipmentImages/:idEquipment', jwt.cdt, checkSize, uploadEquipmentImages.array('images', 1), async (req, res) => {
        const { idEquipment } = req.params;

        if (req.files.length === 0 || req.params == undefined || req.params == null || req.params == '') {
            return res.status(400).send('Nenhuma imagem enviada.');
        } else {
            const imagens = req.files.map(file => {
                return { equipments_id: idEquipment, path: getImagePath(file), name: file.originalname };
            });
            try {
                await app.models.images.bulkCreate(imagens);
                return res.status(201).send({ message: 'Imagens enviadas e salvas no banco de dados com sucesso!', imagens });
            } catch (err) {
                console.error('Erro ao inserir imagens no banco de dados:', err);
                return res.status(400).send({ message: 'Erro ao salvar as imagens no banco de dados.', imagens });
            }
        }
    });


    app.get('/EquipmentsImage/:idEquipment', jwt.all, async (req, res) => {
        const { idEquipment } = req.params;

        try {
            const imagens = await app.models.images.findAll({ where: { equipments_id: idEquipment }, order: [['updatedAt', 'DESC']] });
            return res.status(200).json(imagens);
        } catch (err) {
            console.error('Erro ao buscar imagens do banco de dados:', err);
            return res.status(400).send({ message: 'Erro ao buscar imagens do banco de dados.' });
        }
    })


    app.post('/upload/:idItem', jwt.cdt, checkSize, uploadItemImages.array('images', 5), async (req, res) => {
        const { idItem } = req.params;
        if (req.files.length === 0 || req.params == undefined || req.params == null || req.params == '') {
            return res.status(400).send({ message: 'Nenhuma imagem enviada.' });
        } else {
            const imagens = req.files.map(file => {
                return { item_id: idItem, path: getImagePath(file), name: file.originalname };
            });
            try {
                await app.models.images.bulkCreate(imagens);
                return res.status(201).send({ message: 'Imagens enviadas e salvas no banco de dados com sucesso!', imagens });
            } catch (err) {
                console.error('Erro ao inserir imagens no banco de dados:', err);
                return res.status(400).send({ message: 'Erro ao salvar as imagens no banco de dados.' });
            }
        }
    });

    app.get('/images/:idItem', jwt.all, async (req, res) => {
        const { idItem } = req.params;
        try {
            const imagens = await app.models.images.findAll({ where: { item_id: idItem } });
            return res.status(200).json(imagens);
        } catch (err) {
            console.error('Erro ao buscar imagens do banco de dados:', err);
            return res.status(400).send({ message: 'Erro ao buscar imagens do banco de dados.' });
        }
    })

    app.post('/uploadResponseField/:idResponseField', jwt.cdt, checkSize, uploadEvidenceImages.array('images', 5), async (req, res) => {
        const { idResponseField } = req.params;
        if (req.files.length === 0) {
            return res.status(400).send({ message: 'Nenhuma imagem enviada.' });
        }
        const imagens = await Promise.all(req.files.map(async (file) => {
            const hash = await calculateHash(file.path);
            return {
                response_field_id: idResponseField,
                path: getImagePath(file),
                name: file.originalname,
                hash: hash
            };
        }));

        try {
            await app.models.images.bulkCreate(imagens);
            return res.status(201).send({ message: 'Imagens enviadas e salvas no banco de dados com sucesso!', imagens });
        } catch (err) {
            console.error('Erro ao inserir imagens no banco de dados:', err);
            return res.status(400).send({ message: 'Erro ao salvar as imagens no banco de dados.' });
        }
    });

    app.get('/imagesResponseField/:idResponseField', jwt.all, async (req, res) => {
        const { idResponseField } = req.params;
        try {
            let imagens = await app.models.images.findAll({ where: { response_field_id: idResponseField } });
            if (req.userProfile == 'cdt') {
                imagens = await Promise.all(imagens.map(async (image) => {
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
                    });

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
                }));
            }
            return res.status(200).json(imagens);
        } catch (err) {
            console.error('Erro ao buscar imagens do banco de dados:', err);
            return res.status(400).send({ message: 'Erro ao buscar imagens do banco de dados.' });
        }
    })

    app.delete('/deleteImage/:idImage', jwt.cdt, async (req, res) => {
        const { idImage } = req.params;
        try {
            const imageDelete = await app.models.images.destroy({ where: { id: idImage } });
            return res.status(200).send({ message: 'Imagem excluída com sucesso!' });
        } catch (err) {
            console.error('Erro ao excluir imagem do banco de dados:', err);
            return res.status(400).send({ message: 'Erro ao excluir imagem do banco de dados.' });
        }
    })
}
