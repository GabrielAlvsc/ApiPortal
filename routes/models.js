module.exports = (app) => {
  const moment = require('moment-timezone');
  const currentDate = moment().format('YYYY-MM-DD');
  const { Op } = require('sequelize');
  const models = app.models.models;

  async function checkOrder(fathers) {
    let higherOrder = 1;
    for (const index in fathers) {
      if (fathers[index].order != higherOrder) {
        await app.models.items.update({ order: higherOrder}, { where: { id: fathers[index].id } });
      }
      higherOrder += 1;
      let subitems = await app.models.items.findAll({
        where: {
          version_id: fathers[index].version_id,
          father_id: fathers[index].id
        },
        order: [['order', 'ASC']]
      });
      if (subitems) {
        await checkOrder(subitems);
      }
    }
  }

  async function full_Order(itemiv) {
    console.log(itemiv.is_subitem);
    if(!itemiv.is_subitem) {
      let father = await app.models.items.findOne({
        where: {
          version_id: itemiv.version_id,
          id: itemiv.father_id
        }
      })
      return full_Order(father) + "." + String(itemiv.order);
    } else {
      return String(itemiv.order);
    }
  }

  async function true_Order(item) {
    return 0;
  }

  app.post("/models", app.auth.cdt, async (req, res) => {
    try {
      const { title, category_id, } = req.body;
      const result = await app.models.models.create({
        title, category_id, active: true
      });
      const version = await app.models.versions.create({ "concluded": false, "version": "1", "model_id": result.id, "user_responsible_id": req.userId, "comment": "Primeira Versão" })

      app.log.register(app.log.actions.createModel, req.userId,
        `"${req.user.name}" Criou o modelo "${title}" V: 1`,
        { version_id: version.id, model_id: version.model_id },);

      return res.status(201).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });


  app.get("/availableModels", app.auth.cdt, async (req, res) => {
    try {
      let result = await app.models.models.findAll({
        where: {
          active: true,
        },
        order: [['id', 'ASC']],
        include: [
          {
            model: app.models.categories,
            attributes: ['name']
          },
          {
            model: app.models.versions,
            order: [['createdAt', 'DESC']],
            limit: 1
          }
        ]
      });

      result = result.filter((modelo) => modelo.versions[0]?.concluded).map(modelo => {
        modelo = modelo.get({ plain: true });
        modelo.version = modelo.versions[0];
        modelo.versions = undefined;
        return modelo;
      });

      const usuarios = await app.models.users.findAll({ where: { active: true }, attributes: ['id', 'name', 'profile'] });

      const equipments = await app.models.equipaments.findAll({ where: { active: true }, attributes: ['id', 'name', 'vendor'] });

      return res.status(200).json({ models: result, users: usuarios, equipments: equipments });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });


  app.get("/models", app.auth.cdt, async (req, res) => {
    try {
      const result = await app.models.models.findAll({
        where: {
          active: true,
        },
        order: [['title', 'ASC']],
        include: [
          {
            model: app.models.categories,
            attributes: ['name']
          },
          {
            model: app.models.versions,
            order: [['createdAt', 'DESC']],
            limit: 1
          }
        ]
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.get("/modelsAll", app.auth.all, async (req, res) => {
    try {
      const result = await app.models.models.findAll({
        where: {
          active: true,
        },
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.get('/model/:idModel/version/:idVersion', app.auth.all, async (req, res) => {
    try {
      const { idModel, idVersion } = req.params;
      const resultIdModel = await app.models.models.findOne({
        where: {
          id: idModel
        }
      });
      const resultIdVersion = await app.models.versions.findOne({
        where: {
          id: idVersion
        }
      })

      let features = await app.models.features.findAll({
        where: {
          version_id: resultIdVersion.id,
          is_variable: true,
        },
        order: [['order', 'ASC']],
      });

      const itemsInVersion = await app.models.items.findAll({
        where: {
          version_id: resultIdVersion.id,
          fillable: true,
        },
        order: [['order', 'ASC']],
      });

      const result = {
        resultIdModel, resultIdVersion, features, itemsInVersion
      }

      return res.status(200).json(result)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
    }
  })

  app.get('/myBooks/:idBook/model/:idModel/version/:idVersion', app.auth.all, async (req, res) => {
    try {
      const { idModel, idVersion, idBook } = req.params;

      const resulta = await app.models.books.findOne({
        where: {
          id: idBook,
          user_executor_id: req.userId,
          end_date: {
            [Op.gte]: currentDate
          }
        }
      })

      console.log(resulta);

      if (resulta) {
        const resultIdModel = await app.models.models.findOne({
          where: {
            id: idModel
          }
        });
        const resultIdVersion = await app.models.versions.findOne({
          where: {
            id: idVersion
          }
        })

        let features = await app.models.features.findAll({
          where: {
            version_id: resultIdVersion.id,
            is_variable: false,
          },
          order: [['order', 'ASC']],
        });

        const itemsInVersion = await app.models.items.findAll({
          where: {
            version_id: resultIdVersion.id,
            fillable: true,
          },
          order: [['order', 'ASC']],
        });

        const result = {
          resultIdModel, resultIdVersion, features, itemsInVersion
        }

        return res.status(200).json(result)
      } else {
        return res.status(400).json({ message: "Você não tem acesso a esse caderno" })
      }
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
    }
  })

  app.get('/myReviews/:idBook/model/:idModel/version/:idVersion', app.auth.cdt, async (req, res) => {
    try {
      const { idModel, idVersion, idBook } = req.params;

      const resulta = await app.models.books.findOne({
        where: {
          id: idBook,
          user_responsible_id: req.userId,
          end_date: {
            [Op.gte]: currentDate
          }
        }
      })

      if (resulta) {
        const resultIdModel = await app.models.models.findOne({
          where: {
            id: idModel
          }
        });
        const resultIdVersion = await app.models.versions.findOne({
          where: {
            id: idVersion
          }
        })

        let features = await app.models.features.findAll({
          where: {
            version_id: resultIdVersion.id,
          },
          order: [['order', 'ASC']],
        });

        const itemsInVersion = await app.models.items.findAll({
          where: {
            version_id: resultIdVersion.id,
            fillable: true,
          },
          order: [['order', 'ASC']],
        });

        const result = {
          resultIdModel, resultIdVersion, features, itemsInVersion
        }

        return res.status(200).json(result)
      } else {
        return res.status(400).json({ message: "Você não tem acesso a esse caderno" })
      }
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
    }
  })

  app.get('/model/content/:idModel', app.auth.cdt, async (req, res) => {
    try {
      const { idModel } = req.params;

      const model = await app.models.models.findByPk(idModel);

      const recentVersion = await app.models.versions.findOne({
        where: {
          model_id: idModel,
        },
        order: [['createdAt', 'DESC']],
      });

      if (!recentVersion) {
        return res.status(404).json({ message: "Nenhuma versão encontrada para este modelo." });
      }

      let features = await app.models.features.findAll({
        where: {
          version_id: recentVersion.id,
        },
        order: [['order', 'ASC']],
      });

      let father_items = await app.models.items.findAll({
        where: {
          version_id: recentVersion.id,
          is_subitem: false
        },
        order: [['order', 'ASC']],
      });

      await checkOrder(father_items);

      const itemsInVersion = await app.models.items.findAll({
        where: {
          version_id: recentVersion.id,
        },
        order: [['order', 'ASC']],
      });

      for (const item in itemsInVersion) {
        let fullOrder = ""
        //console.log(itemsInVersion[item].is_subitem)
        if (!itemsInVersion[item].is_subitem) {
          fullOrder = String(itemsInVersion[item].order)
          //console.log(fullOrder)
        } else {
          let i = itemsInVersion[item]
          fullOrder = String(itemsInVersion[item].order)
          while (i.is_subitem != false) {
            fid = i.father_id
            i = await app.models.items.findOne({
              where: {
                version_id: recentVersion.id,
                id: fid
              }
            })
            fullOrder = String(i.order) + "." + fullOrder

            
          }
          //console.log(fullOrder);
        }
        itemsInVersion[item].setDataValue("fullorder", fullOrder);
        //console.log(itemsInVersion[item])
        
      }

      //ordenar itemsInVersion por fullOrder
      itemsInVersion.sort((a, b) => {
        const orderA = a.getDataValue("fullorder");
        const orderB = b.getDataValue("fullorder");
        return orderA.localeCompare(orderB, "en", { numeric: true });
      });
      

      const result = {
        model,
        recentVersion,
        features,
        itemsInVersion,
        //fullOrderItems
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
    }
  })

  app.patch("/models/:id", app.auth.cdt, async (req, res) => {
    try {
      const { id } = req.params;
      const where = { id: id };
      const { title, category_id, active } = req.body;
      const result = await app.models.models.update({ title, category_id, active }, { where });
      const version = await app.models.versions.findOne({ where: { model_id: id }, order: [['version', 'DESC']] });
      if (result == 1) {

        app.log.register(app.log.actions.createModel, req.userId,
          `"${req.user.name}" Alterou o modelo "${title}" V: ${version.version}`,
          { version_id: version.id, model_id: result.id },);

        return res.status(200).json({ message: "Atualizado com sucesso" });
      } else {
        return res.status(400).json({ message: "Erro ao atualizar" });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.delete("/models", app.auth.cdt, async (req, res) => {
    try {
      const { id } = req.params;
      const where = { id: id };
      await app.models.models.update({ active: false }, { where });
      return res.status(200).json({ message: "Desativado com sucesso" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.get('/imprimirModel/:idModel', app.auth.cdt, async (req, res) => {
    try {
      const { idModel } = req.params;

      const model = await app.models.models.findByPk(idModel);

      const allVersions = await app.models.versions.findAll({
        where: {
          model_id: idModel,
        },
        order: [['createdAt', 'DESC']],
      });

      if (allVersions.length === 0) {
        return res.status(404).json({ message: "Nenhuma versão encontrada para este modelo." });
      }

      const result = {
        model,
        versions: [],
      };

      for (const version of allVersions) {
        const features = await app.models.features.findAll({
          where: {
            version_id: version.id,
          },
          order: [['order', 'ASC']],
        });

        const itemsInVersion = await app.models.items.findAll({
          where: {
            version_id: version.id,
          },
          order: [['order', 'ASC']],
        });

        const itemsWithFields = [];

        for (const item of itemsInVersion) {
          const itemFields = await app.models.fields.findAll({
            where: {
              item_id: item.id,
            },
          });

          itemsWithFields.push({
            item,
            fields: itemFields,
          });
        }

        result.versions.push({
          version,
          features,
          items: itemsWithFields,
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
    }
  });



  app.get('/modelsStatistics', app.auth.cdt, async (req, res) => {
    try {
      const versions = await app.models.versions.findAll({
        order: [['version', 'ASC']],
        include: [{
          model: app.models.models,
          include: [{
            model: app.models.categories
          }]
        },
        {
          model: app.models.users
        }
        ]
      });
      const models = versions.map((version) => {
        return {
          model: version.model.title,
          category: version.model.category.name,
          version: version.version,
          user: version.user.name,
          finished: version.updatedAt
        }
      })
      return res.status(200).json(models)
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message })
    }
  })
  app.get('/models/:categoriesId', app.auth.cdt, async (req, res) => {

    const categoriesId = req.params.categoriesId
    try {
      const models = await app.models.models.findAll({
        where: {
          category_Id: categoriesId
        },
        attributes: ["id", "title"]
      })

      return res.status(200).json(models);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
    }
  })
   
  app.put('/models/:id/edit', app.auth.cdt, async (req, res) => {
    const modelsId = parseInt(req.params.id);
    const newTitle = req.body.title;

    try{
      const model = await app.models.models.findByPk(modelsId);

      if (!model){
        return res.status(404).json({ message: "Modelo não encontrado"})
      }
      
      model.title = newTitle;
      await model.save();
    
    
    return res.status(200).json({ message: "Título alterado com sucesso!", model });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Ocorreu um erro ao processar sua solicitação" });
  }
  
})
}




