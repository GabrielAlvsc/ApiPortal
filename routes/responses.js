const { Op } = require('sequelize');

module.exports = (app) => {
    const jwt = app.auth;
    const response_features = app.models.response_features;
    const response_fields = app.models.response_fields;
    const response_items = app.models.response_items;
    const correction_items = app.models.correction_items;
    const items = app.models.items;
    const correction_features = app.models.correction_features;
    const books = app.models.books;
    const fields = app.models.fields;
    const feature = app.models.features;



    app.patch('/revisionResponseItem/:idResponseItem', app.auth.all, async (req, res) => {
        try {
            const { idResponseItem } = req.params;
            const { comment, status } = req.body;

            // valida o parametro
            if (!['Aguardando envio para revisão', 'Salvo', 'Em Revisão', 'Reprovado', 'Aprovado'].includes(status)) {
                return res.status(400).json({ message: `o parametro status:"${status}" é inválido!` });
            }
            // pega a resposta do item
            const responseItem = await app.models.response_items.findByPk(idResponseItem);

            // verifica se a resposta do item existe
            if (!responseItem) {
                return res.status(400).json({ message: "Item de resposta não encontrado!" });
            }

            // pega o book da resposta do item
            const book = await app.models.books.findByPk(responseItem.book_id, {
                include: [
                    {
                        model: app.models.versions,
                        include: [{
                            model: app.models.models
                        }]
                    },
                    {
                        model: app.models.equipaments,
                    }]
            });

            // verificar se o caderno não está finalizado
            if (book.status != "Pendente") {
                return res.status(400).json({ message: "O caderno está finalizado e não pode ser alterado!", status: book.status });
            }

            // verificar se o usuário pode alterar
            // usuário responsavel edita quando quer
            // usuário executor edita quando estiver pendente 
            if (req.userId != book.user_responsible_id && req.userId != book.user_executor_id) {
                return res.status(400).json({ message: "Somente o responsável e o executor podem alterar!" });
            }
            if (req.userProfile != 'cdt' && ['Aprovado', 'Reprovado', 'Em revisão'].includes(responseItem.status)) {
                return res.status(400).json({ message: `Não é possivel alterar o item no status: ${responseItem.status}!` });
            }


            const item = await app.models.items.findByPk(responseItem.item_id);

            // Buscar campos com uma feature associada
            const fildsWithFeatures = await app.models.fields.findAll({ where: { item_id: item.id, feature_id: { [Op.ne]: null } } });

            // atualiza a resposta do item 
            await app.models.response_items.update({ comment: comment, status }, { where: { id: idResponseItem } });

            // altera as respostas das feautures que pertencem aos campos desse item
            for (const field of fildsWithFeatures) {
                await app.models.response_features.update({ status }, { where: { feature_id: field.feature_id, book_id: book.id } });
            }
            
            const testName = `"${item.title}" do caderno "${book.version.model.title} V${book.version.version} ${book.equipament.vendor}  ${book.equipament.vendor}"`;
          
            app.log.register(app.log.actions.revisarTeste, req.userId,
                `"${req.user.name}" Mudou o teste ${testName} para o status: "${status}"`,
                { response_item_id: idResponseItem, item_id: item.id, version_id: book.version_id, model_id: book.version.model_id },);

            return res.status(200).json({ message: "Item atualizado!" })

        } catch (error) {
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.patch('/responseFeature/:idResponseFeature', app.auth.all, async (req, res) => {
        try {
            const { idResponseFeature } = req.params;
            const { response, status } = req.body;

            // valida o parametro
            if (!['Aguardando envio para revisão', 'Salvo', 'Em Revisão', 'Reprovado', 'Aprovado'].includes(status)) {
                return res.status(400).json({ message: `o parametro status:"${status}" é inválido!` });
            }
            // pega a resposta do item
            const responseFeature = await app.models.response_features.findByPk(idResponseFeature);
            // verifica se a resposta do item existe
            if (!responseFeature) {
                return res.status(400).json({ message: "Resposta de característica não encontrado!" });
            }

            // pega o book da resposta do item
            const book = await app.models.books.findByPk(responseFeature.book_id, {
                include: [
                    {
                        model: app.models.versions,
                        include: [{
                            model: app.models.models
                        }]
                    },
                    {
                        model: app.models.equipaments,
                    }]
            });

            // verificar se o caderno não está finalizado
            if (book.status != "Pendente") {
                return res.status(400).json({ message: "O caderno está finalizado e não pode ser alterado!", status: book.status });
            }

            // verificar se o usuário pode alterar
            // usuário responsavel edita quando quer
            // usuário executor edita quando estiver pendente 
            if (req.userId != book.user_responsible_id && req.userId != book.user_executor_id) {
                return res.status(400).json({ message: "Somente o responsável e o executor podem alterar!" });
            }
            if (req.userProfile != 'cdt' && ['Aprovado', 'Reprovado', 'Em revisão'].includes(responseFeature.status)) {
                return res.status(400).json({ message: `Não é possivel alterar o item no status: ${responseFeature.status}!` });
            }
            const feature = await app.models.features.findByPk(responseFeature.feature_id);
            // atualiza a resposta da feature 
            await app.models.response_features.update({response, status }, { where: { id: idResponseFeature } });
           
            const testName = `"${feature.name}" do caderno "${book.version.model.title} V${book.version.version} ${book.equipament.vendor}  ${book.equipament.vendor}"`;
          
            app.log.register(app.log.actions.revisarTeste, req.userId,
                `"${req.user.name}" Mudou a característica ${testName} para o status: "${status}"`,
                { response_feature_id: idResponseFeature, feature_id: feature.id, version_id: book.version_id, model_id: book.version.model_id },);

            return res.status(201).json({ message: "Caracteristica respondida com sucesso!" })

        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.post('/correctionFeatures/:idResponseFeature', jwt.cdt, async (req, res) => {
        try {
            const { idResponseFeature } = req.params;
            const { revision } = req.body;
            const responseFeature = await response_features.findByPk(idResponseFeature);
            const book = await books.findByPk(responseFeature.book_id);
            if (req.userId != book.user_responsible_id) {
                return res.status(400).json({ message: "Somente o responsável pode criar!" });
            }

            // verificar se o caderno não está finalizado   
            if (book.status != "Pendente") {
                return res.status(400).json({ message: "O caderno está finalizado e não pode ser alterado!", status: book.status });
            }

            await correction_features.create({
                revision: revision,
                ajusted: false,
                response_feature_id: idResponseFeature
            });

            return res.status(201).json({ message: "Correção criada com sucesso!" })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.patch('/correctionFeatures/:idCorrectionFeature', jwt.cdt, async (req, res) => {
        try {
            const { idCorrectionFeature } = req.params;
            const { revision, ajusted } = req.body;
            const correctionFeature = await correction_features.findByPk(idCorrectionFeature);
            const responseFeature = await response_features.findByPk(correctionFeature.response_feature_id);
            const book = await books.findByPk(responseFeature.book_id);
            if (req.userId != book.user_responsible_id) {
                return res.status(400).json({ message: "Somente o responsável pode alterar!" });
            }

            // verificar se o caderno não está finalizado   
            if (book.status != "Pendente") {
                return res.status(400).json({ message: "O caderno está finalizado e não pode ser alterado!", status: book.status });
            }

            await correction_features.update({
                revision: revision,
                ajusted: ajusted
            }, { where: { id: idCorrectionFeature } });

            return res.status(200).json({ message: "Correção atualizada com sucesso!" })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.get('/returnCorrectionFeature/:idResponseFeature', jwt.all, async (req, res) => {
        try {
            const { idResponseFeature } = req.params;
            const returnResponseFeature = await response_features.findByPk(idResponseFeature);
            const returnBook = await books.findByPk(returnResponseFeature.book_id);

            // verificar se o usuário pode ver as correções
            if (req.userProfile != 'cdt' && returnBook.user_executor_id != req.userId) {
                return res.status(400).json({ message: "Somente o responsável e o executor podem ver as correções!" });
            }
            const where = {
                response_feature_id: idResponseFeature
            }
            // o executor não ve o historico
            if (returnBook.user_executor_id == req.userId) {
                where.ajusted = false;
            }
            const correctionFeatures = await correction_features.findAll({
                where
            });
            return res.status(200).json(correctionFeatures)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })



    app.patch('/responseField/:idResponseField', jwt.all, async (req, res) => {
        try {
            const { idResponseField } = req.params;
            const { response, hash } = req.body;

            const responseField = await response_fields.findByPk(idResponseField);
            const field = await fields.findByPk(responseField.field_id);
            const responseItemFind = await response_items.findByPk(responseField.response_item_id);
            const bookFind = await books.findByPk(responseItemFind.book_id);
            // verificar se o usuario pode responder

            if (req.userId != bookFind.user_executor_id && req.userId != bookFind.user_responsible_id) {
                return res.status(400).json({ message: "Somente o executor e o responsável podem responder!" });
            }

            // verificar se o caderno não está finalizado
            if (bookFind.status != "Pendente") {
                return res.status(400).json({ message: "O caderno está finalizado e não pode ser alterado!", status: bookFind.status });
            }

            const updatedResponseField = await responseField.update(
                { response: response, hash: hash },
                {
                    where: { id: idResponseField }
                });

            if (field.feature_id != null) {// está associado a uma feature
                await response_features.update({ response: response }, { where: { feature_id: field.feature_id, book_id: bookFind.id } });
            }
            return res.status(201).json(updatedResponseField);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })


    app.post('/correctionItem/:idResponseItem', jwt.cdt, async (req, res) => {
        try {
            const { idResponseItem } = req.params;
            const { revision } = req.body;

            const responseItem = await response_items.findByPk(idResponseItem);
            const book = await books.findByPk(responseItem.book_id);

            // verificar se o usuario pode responder
            if (req.userId != book.user_responsible_id) {
                return res.status(400).json({ message: "Somente o responsável podem criar as correções!" });
            }
            // verificar se o caderno não está finalizado
            if (book.status != "Pendente") {
                return res.status(400).json({ message: "O caderno está finalizado e não pode ser alterado!", status: book.status });
            }

            const correctionItem = await correction_items.create({
                revision: revision,
                ajusted: false,
                response_item_id: idResponseItem
            });



            return res.status(201).json({ message: "Correção criada com sucesso!", correctionItem })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })


    app.patch('/correctionItem/:idCorrectionItem', jwt.cdt, async (req, res) => {
        try {
            const { idCorrectionItem } = req.params;
            const { revision, ajusted } = req.body;

            const correctionItem = await correction_items.findByPk(idCorrectionItem);
            const responseItem = await response_items.findByPk(correctionItem.response_item_id);
            const book = await books.findByPk(responseItem.book_id);

            // verificar se o usuario pode responder
            if (req.userId != book.user_responsible_id && req.userId != book.user_executor_id) {
                return res.status(400).json({ message: "Somente o responsável e o executor podem responder!" });
            }
            // verificar se o caderno não está finalizado
            if (book.status != "Pendente") {
                return res.status(400).json({ message: "O caderno está finalizado e não pode ser alterado!", status: book.status });
            }

            await correction_items.update({
                revision: revision,
                ajusted: ajusted
            }, { where: { id: idCorrectionItem } });

            return res.status(200).json({ message: "Correção atualizada com sucesso!" })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })

    app.get('/returnCorrectionItem/:idResponseItem', jwt.all, async (req, res) => {
        try {
            const { idResponseItem } = req.params;
            const returnResponseItem = await response_items.findByPk(idResponseItem);
            const returnBook = await books.findByPk(returnResponseItem.book_id);

            // verificar se o usuário pode ver as correções
            if (req.userProfile != 'cdt' && returnBook.user_executor_id != req.userId) {
                return res.status(400).json({ message: "Somente o responsável e o executor podem ver as correções!" });
            }
            const where = { response_item_id: idResponseItem }
            // o executor não ve o historico
            if (returnBook.user_executor_id == req.userId) {
                where.ajusted = false;
            }
            const correctionItems = await correction_items.findAll({
                where
            });
            return res.status(200).json(correctionItems)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
        }
    })
}
