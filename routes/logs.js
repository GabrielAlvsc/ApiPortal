const moment = require('moment-timezone');
module.exports = (app) => {
    const Moment = require('moment-timezone');
    const { Op } = require('sequelize');

    app.get('/logs', app.auth.cdt, async (req, res) => {
        try {
            const { user_id, action, date } = req.query;
            let where = {};
            if (date) {
                where = {
                    createdAt: {
                        [Op.gte]: date
                    }
                }
            }
            if (user_id) {
                where.user_id = user_id
            }
            if (action) {
                where.action = action
            }
            let logs = await app.models.logs.findAll({
                raw: true,
                order: [['id', 'DESC']],
                where
            });
            return res.status(200).json(logs);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    })
};

