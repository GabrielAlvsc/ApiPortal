// module.exports = (app) => {
//     const { Op } = require('sequelize');

// app.get('/pietro', app.auth.cdt, async (req, res) => {
//     try {
//         const result = await app.models.books.findAll({
//             raw: true,
//             nest: true,
//             //attributes: ['start_date', 'end_date', 'id', "status"],
//             // where: {
//             //     [Op.not]: [
//             //         { status: "Cancelado" }
//             //     ]
//             // }

//     })
//     return res.status(200).json(result);
// }
// catch (error) {
//     console.log(error);
//     return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
// }
// });
// }