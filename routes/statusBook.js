module.exports = (app) => {
  const { Op } = require('sequelize');

  app.post('/statusBook/:idBook', app.auth.all, async (req, res) => {
    const { idBook } = req.params;
    const { status, comment } = req.body;
    try {
      const book = await app.models.books.findOne({
        where: { id: idBook },
        include: [{ model: app.models.versions, include: [{ model: app.models.models }] },
        {
          model: app.models.equipaments,
        }]
      });

      await app.models.statusBook.create({ idBook, status, comment, user_id: req.userId });
      await app.models.books.update({ status: status }, { where: { id: idBook } });

      app.log.register(app.log.actions.finishBook, req.userId,
        `"${req.user.name}" Mudou para "${status}" o caderno "${book.version.model.title} V${book.version.version} ${book.equipament.vendor}  ${book.equipament.vendor}"`,
        { book_id: book.id, equipment_id: book.equipament_id, version_id: book.version_id, model_id: book.version.model_id },);

      return res.status(201).json({ message: "Status alterado!" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
    }
  })


  app.get('/statusBook/:idBook', app.auth.all, async (req, res) => {
    const { idBook } = req.params;
    try {
      const result = await app.models.statusBook.findAll({
        where: { idBook: idBook },
        order: [['createdAt', 'DESC']],
        include: [{
          model: app.models.users,
          attributes: { exclude: ["password", "ip", "active"] },
        }],
      });


      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
    }
  });
}
