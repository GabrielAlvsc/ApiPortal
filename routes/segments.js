module.exports = (app) => { 
    const models = app.models.models;
    const categories = app.models.categories;
    const jwt = app.auth;

    app.get('/categories/:id', jwt.all, async(req, res) => {
        try {
            const { id } = req.params;
            const where = {id: id};
            const result = await categories.findOne({
                where,
                include: [{ model: models }],
            })
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(400).json({message: "Ocorreu um erro para processar sua solicitação"})
        }
    })

    app.get('/categories', jwt.all, async(req, res) => {
        try {
            const result = await categories.findAll();
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
            return res.status(400).json({message: "Ocorreu um erro para processar sua solicitação"})
        }
    })
}