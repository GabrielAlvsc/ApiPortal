// module.exports = (app) => {
//     app.get('/testimages', async (req, res) => {
//         try {
//             let { limit } = req.query;// pega o valor depois de /rota?
//             limit = parseInt(limit);
//             if (!limit || limit <= 0) {
//                 limit = 5;

//             }
//             const recentBooks = await app.models.books.findAll({
//                 where: { status: "Aprovado" },
//                 limit,
//                 order: [['updatedAt', 'DESC']],
//             });
//             if (!recentBooks) {
//                 return res.status(404).json({ message: "Caderno não encontrado" })
//             }
            

//             const books = await Promise.all(recentBooks.map(async (tbook) => {
//                 const idBook = tbook.id;
//                 const book = await app.models.books.findByPk(idBook, {
//                     attributes: ["sgd", "status", "end_date"],
//                 });
//                 return { book }
//             }));

//             return res.status(200).json(books)



//         }
//         catch (error) {
//             console.log(error);
//             return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
//         }


//     })
// }
	
