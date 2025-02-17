module.exports = (app) => {
    const tickets = app.models.tickets;
    const jwt = app.auth;
    const moment = require('moment-timezone');

    app.get("/tickets", jwt.cdt, async (req, res) => {
        try {
            const result = await tickets.findAll({
                attributes: { exclude: ["createdAt", "updatedAt"] },
                raw: true,
                nest: true,
                include: [
                    {
                        model: app.models.users,
                        as: 'user_req',
                        attributes: ['id','name']
                    },
                    {
                        model: app.models.users,
                        as: 'user_resp',
                        attributes: ['id','name']
                    },            
                ]
            });
            return res.status(200).json(result);
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
        }
    });

    app.get("/tickets/:userId", app.auth.cdt, async (req, res) => {
        try {
            const { userId } = req.params;
            const result = await tickets.findAll(
                {
                    attributes: { exclude: ["createdAt", "updatedAt"] },
                    where: { user_requester: userId }
                })
            if (!result) {
                return res.status(404).json({ message: "Ticket não encontrado" });
            }

            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    })

    app.post("/tickets", app.auth.cdt, async (req, res) => {
        try {
            //Dados do ticket são recebidos no corpo da requisição {} = req.body
            const { title, description, category, user_requester, finished } = req.body;

            //validação dos dados
            if (!title) {
                return res.status(400).send({ message: 'O campo "assunto" é obrigatorio!' });
            }
            if (!category) {
                return res.status(400).send({ message: 'O campo "categoria" é obrigatório!' });

            }

            const start_date = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');
            const end_date = null;

            const result = await app.models.tickets.create({
                title,
                description,
                category,
                user_requester,
                start_date,
                finished,
                end_date
            })

            app.log.register(app.log.actions.createTicket, req.userId,
                `"${req.user.name}" criou o ticket`,
                { tickets_id: result.id });


            return res.status(201).send(result)
        } catch (error) {
            console.log('Erro ao criar o ticket:', error);
            return res.status(500).send({ error: 'Erro ao criar o ticket' })

        }

    });

    app.patch("/tickets/:id", jwt.cdt, async (req, res) => {
        try {
            const { id } = req.params;
            const where = { id: id };
            const { finished, user_responsible } = req.body;

            //Busca o ticket pelo ID no bando de dados
            const ticket = await app.models.tickets.findByPk(id);
            let end_date = null;

    
            if (!ticket) {
                return res.status(404).send({ message: 'Ticket não encontrado!' })
            }
            //Se o campo finished for preenchido como true, o campo end_date será preenchido com a data de termino.
            if (finished == true) {
                end_date = new Date();
            }
            //Quando o campo user_responsible for preenchido, apenas esse campo será atualizado.
            if (user_responsible) {
                ticket.user_responsible = user_responsible;
            }
            //Salva as alterações no banco de dados
            const result = await app.models.tickets.update({ user_responsible, end_date, finished }, { where });

            //Registra a acão no log
            if (result == 1) {
                app.log.register(app.log.actions.updateTicket, req.userId,
                    `"${req.user.name}" Atualizou o ticket "${ticket.id}"`,
                    { ticket_id: ticket.id, finished: ticket.finished, user_responsible: ticket.user_responsible, end_date: ticket.end_date });
                return res.status(200).send({ message: 'Ticket atualizado! ' });
            }

        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: 'Ocorreu um erro ao processar sua solicitação', error });
        }
    });
};