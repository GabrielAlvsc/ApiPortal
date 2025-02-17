const { Association } = require('sequelize');
//const { promises } = require('supertest/lib/test');
const moment = require('moment-timezone');
// const tag_associations = require('../models/tag_associations');

module.exports = (app) => {
  const jwt = app.auth;
  const equipaments = app.models.equipaments;
  const image = app.models.images;
  const moment = require('moment-timezone');
 
  app.post("/equipments", jwt.cdt, async (req, res) => {
    try {
      const { endofsales} = req.body;
      let newEquipment = {
        name: req.body.name,
        vendor: req.body.vendor,
        price: req.body.price,
        sap: req.body.sap,
      }
      if (endofsales) {
        const formattedEndOfSales = moment(endofsales, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const endOfSalesDateWithTimezone = moment.tz(formattedEndOfSales, 'YYYY-MM-DD', 'America/Sao_Paulo');
        newEquipment.endofsales = endOfSalesDateWithTimezone;
      }
      const result = await equipaments.create(newEquipment);


      app.log.register(app.log.actions.createEquipment, req.userId,
        `"${req.user.name}" criou o equipamento ${newEquipment.vendor} ${newEquipment.name}`,
        { equipment_id: result.id });

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
    }
  });

  app.get("/equipments", jwt.cdt, async (req, res) => {
    try {
      const result = await equipaments.findAll({
        raw: true,
        nest: true,
        where: {
          active: true,
        },
        attributes: ["id", "name", "vendor", "price", "endofsales", "sap"],
        order: [['name', 'ASC']],
        include: [{
          limit: 1,
          required: false,
          model: image,
          attributes: ['path', 'name', 'id'],
          order: [['createdAt', 'DESC']],
        }]
      });
      for (const eq of result) {
        eq.image = eq.images?.path || '/uploads/default.png';
        eq.images = undefined;
        eq.endofsales = eq.endofsales ? moment.tz(eq.endofsales, 'America/Sao_Paulo').format('DD/MM/YYYY') : '';
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
    }
  });


  app.get("/equipments/:id", jwt.cdt, async (req, res) => {
    try {
      const { id } = req.params;
      const where = { id: id, active: true };
      const result = await equipaments.findOne({ where });

      const formattedResult = {
        ...result.dataValues,
        endofsales: moment
          .tz(result.endofsales, 'America/Sao_Paulo')
          .format('DD/MM/YYYY')
      };

      return res.status(200).json(formattedResult);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.patch("/equipments/:id", jwt.cdt, async (req, res) => {
    try {
      const { id } = req.params;
      const where = { id: id };
      let { endofsales, name, price, vendor, sap } = req.body;
      if (endofsales) {
        const formattedEndOfSales = moment(endofsales, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const endOfSalesDateWithTimezone = moment.tz(formattedEndOfSales, 'YYYY-MM-DD', 'America/Sao_Paulo');
        endofsales = endOfSalesDateWithTimezone;
      }

      const eq = await equipaments.findOne({ where, raw: true });
      if (!eq) {
        return res.status(400).json({ message: "Equipamento inexistente" });
      }
      await equipaments.update({ endofsales, name, price, vendor, sap }, { where });

      app.log.register(app.log.actions.updateEquipment, req.userId,
        `"${req.user.name}" Atualizou o equipamento ${eq.vendor} ${eq.name}`,
        { equipment_id: id });

      return res.status(200).json({ message: "Atualizado com sucesso" });

    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" });
    }
  });

  app.delete("/equipments/:id", jwt.cdt, async (req, res) => {
    try {
      const { id } = req.params;
      const where = { id: id };
      const eq = await equipaments.findOne({ where, raw: true });
      if (!eq) {
        return res.status(400).json({ message: "Equipamento inexistente" });
      }
      await equipaments.update({ active: false }, { where });

      app.log.register(app.log.actions.deleteEquipment, req.userId,
        `"${req.user.name}" Apagou o equipamento ${eq.vendor} ${eq.name}`,
        { equipment_id: id });
      return res.status(200).json({ message: "Apagado com sucesso" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });
};
