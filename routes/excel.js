const { Op } = require("sequelize");
const moment = require('moment-timezone');
const XLSX = require("xlsx");
module.exports = (app) => {

    app.get('/xl', async (req, res) => {
        const busca = req.query;
        console.log(busca.search)

        if (!busca) {
            return res.status(400).json({ message: "Insira uma busca" })
        }

        if (busca.search.length == 0) {
            return res.status(400).json({ message: "Insira uma busca" })
        }

        try {
            let search = await app.models.books.findAll({
                where: {
                    status: {
                        [Op.not]: ["Pendente", "Cancelado"]
                    }
                },
                include: [
                    {
                        model: app.models.versions,
                        include: [
                            {
                                model: app.models.models,
                                include: [
                                    {
                                        model: app.models.categories
                                    }]
                            },
                        ]
                    },
                    {
                        model: app.models.equipaments,
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            search = search.map((bk) => bk.toJSON());
                let portalData = [];
                const equip = {};

                for (const bk of search) {
                    if (!(bk.equipament.id in equip)) {
                        equip[bk.equipament.id] = {};
                    }
                    // verificar se tem esse modelo no equipamento,
                    // caso exista verifica se a data do book e a mais antiga, se for mais antiga então não adiciona
                    if (!(bk.version.model.category.id in equip[bk.equipament.id])) {
                        equip[bk.equipament.id][bk.version.model.category.id] = bk;
                }
            }
            let filterRegex = new RegExp(`${busca.search}`,"i"); //Regex é uma alternativa para uma busca mais "Exata" nao utilizado para combinar com a busca do front
            for (const equipament of Object.values(equip)) {
                for (const caderno of Object.values(equipament)) {
                    // const status = await statusBook.findOne({ where: { idBook: data.id } })
                    
                    if (filterRegex.test(caderno.status) || filterRegex.test(caderno.equipament.vendor) 
                        || filterRegex.test(caderno.equipament.name) || filterRegex.test(caderno.version.model.title)
                        || filterRegex.test(caderno.version.model.category.name) || filterRegex.test(caderno.equipament.sap)){
                    
                        portalData.push({
                            "Equipamento/Produto": caderno.equipament.name,
                            "Fabricante": caderno.equipament.vendor,
                            "Status": caderno.status,
                            "Tipo": caderno.version.model.title,
                            "Categoria": caderno.version.model.category.name,
                            "End Of Sales": moment.tz(caderno.end_date, 'America/Sao_Paulo').format('DD/MM/YYYY'),
                            "SAP": caderno.equipament.sap,
                            
                            // "comment": status,
                            
                            
                        })
                    }
                }
            }
            let pl = portalData.length;
            if (pl==0) {
                return res.status(400).json({ message: "A busca não gerou resultados" })
            }
            const ws = XLSX.utils.json_to_sheet(portalData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Resultado da pesquisa");
            XLSX.writeFile(wb, `sheets/${busca.search}.xlsx`);


            res.setHeader("Content-Disposition", "attachment; filename=planilha.xlsx");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.download(`sheets/${busca.search}.xlsx`, (err) => {
                if (err) {
                    console.log(err);
                    if (!res.headersSent) {
                        res.status(500).json({ error: "Erro ao fazer download" });
                    }
                }
            });
            // return res.status(200).json({busca, portalData, results: pl});
        }
        catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    })
    
}