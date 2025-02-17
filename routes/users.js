const { where } = require("sequelize");

module.exports = (app) => {
  const users = app.models.users;
  const jwt = app.auth;
  const bcrypt = require("bcrypt");
  function createRandomPassword(ncharacters) {
    const vocabulary = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&?';
    let password = [];
    for (let i = 0; i < ncharacters; i++) {
      let number = Math.floor(Math.random() * vocabulary.length);
      let character = vocabulary.charAt(number);
      password.push(character)
    }
    return password.join('');
  }

  function passwordEntropy(senha) {
    let pool = 0;
    // Tamanho do conjunto de caracteres (pool) utilizado na senha
    if (/[a-z]/.test(senha)) pool += 26; // Letras minúsculas
    if (/[A-Z]/.test(senha)) pool += 26; // Letras maiúsculas
    if (/\d/.test(senha)) pool += 10;    // Números
    if (/[@$!%*?&]/.test(senha)) pool += 10; // Caracteres especiais comuns
    // Outros caracteres especiais não cobertos explicitamente
    if (/[^a-zA-Z\d@$!%*?&]/.test(senha)) pool += 32;
    // Cálculo da entropia
    const entropia = senha.length * Math.log2(pool);
    return entropia;
  }

  app.get("/users", jwt.cdt, async (req, res) => {
    try {
      const result = await users.findAll({
        attributes: { exclude: ["password"] },
        where:{
          active: true
        }
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.get("/users/portal", 
    // jwt.cdt, 
    async (req, res) => {
    try {
      const result = await users.findAll({
        attributes: { exclude: ["password"] },
        where:{
          active: true
        }
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.post("/users", jwt.cdt, async (req, res) => {
    try {
      const { username, name, email, profile, ip, company } = req.body;
      if (!username || !name || !email || !profile) {
        return res.status(400).json({ message: "Preencha todos os campos {username,name,email,profile,ip,company}" });
      }
      const password = createRandomPassword(8);
      // não pode ter usuário com mesmo nome ou com mesmo email
      let user = await users.findOne({ where: { username } });
      if (user)
        return res.status(400).json({ message: "Ja existe um usuario com este username" });
      user = await users.findOne({ where: { email } });
      if (user)
        return res.status(400).json({ message: "Ja existe um usuario com este email" });
      await users.create({ username, name, password, email, profile, ip, company, change_password: true });
      return res.status(201).json({ message: "Usuário criado", password });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Erro ao criar usuario" });
    }
  });


  app.patch("/users/:userId", jwt.cdt, async (req, res) => {
    try {
      const { name, email, profile, company, active, ip } = req.body;
      const { userId } = req.params;
      
  
      let user = await app.models.users.findByPk(userId);
      if (!user)
        return res.status(400).json({ message: "Nenhum usuário encontrado" });

      await app.models.users.update({ name, email, profile, ip, company, active }, { where: { id: userId } });

      return res.status(201).json({ message: "Usuário alterado com sucesso" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.put("/updatePassword", app.auth.all, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      let user = await users.findByPk(req.userId);

      let entropy = passwordEntropy(newPassword);
      let passwordStrong = ''
      if (entropy < 28) {
        return res.status(400).json({ message: `Senha INSEGURA nível ${parseInt(entropy)}` });
      } else if (entropy < 36) {
        return res.status(400).json({ message: `Senha muito fraca nível ${parseInt(entropy)}` });
      } else if (entropy < 60) {
        return res.status(400).json({ message: `Senha fraca nível ${parseInt(entropy)}` });
      } else if (entropy < 128) {
        passwordStrong = `Senha forte nível ${parseInt(entropy)}`;
      } else {
        passwordStrong = `Senha muito forte nível ${parseInt(entropy)}`;
      }
      if (oldPassword == newPassword) {
        return res.status(400).json({ message: "A nova senha não pode ser igual a antiga" });
      }

      if (bcrypt.compareSync(oldPassword, user.password)) {
        user.password = newPassword;
        user.change_password = false;
        await user.save();
        return res.status(200).json({ message: `Senha alterada com sucesso. ${passwordStrong}` });
      }
      return res.status(400).json({ message: "Senha antiga incorreta" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Erro ao atualizar usuario" });
    }
  });

  app.put("/recoveryPassword/:userId", app.auth.cdt, async (req, res) => {
    try {
      // Captura o valor userId passado na rota
      const { userId } = req.params;

      // pega no banco o usuario
      const user = await app.models.users.findByPk(userId);

      //verificar se o usuario existe 
      if (!user) {
        // user = null ou user = undefined
        return res.status(400).json({ message: "Usuário não existe" })
      }
      const newPassword = createRandomPassword(8);
      user.password = newPassword;
      user.change_password = true;
      await user.save();
      return res.status(200).json({ message: `Senha do usuário ${user.username} Alterada com sucesso!!`, password: newPassword });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Falha na alteração" })
    }
  });

  app.patch("/changeTemplate/:userId", app.auth.cdt, async (req, res) => {
    try {
        const { userId } = req.params;
        const { active, name, company } = req.body
      
        await app.models.users.update({ active, name, company }, { where: { id: userId } });
        res.send({ message: "Usuário alterado!"});
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: `Erro ao atualizar o usuário com Id ${userId}`});
    }
  })

  app.get("/usersTickets/:userId", jwt.cdt, async (req, res) => {
    try {
      const { UserId } = req.params;
      const result = await users.findOne({
        attributes: { exclude: ["password"] },
        where:{
          // active: true,
          id: UserId,
        },
        include: [
          {
            model: app.models.tickets,
            as: 'resposibleFor',
            attributes: ['id', 'title', 'description', 'category' ,'user_requester', 'start_date', 'end_date']
          }
        ]
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

  app.get("/usersTickets", jwt.cdt, async (req, res) => {
    try {
      const result = await users.findAll({
        attributes: { exclude: ["password"] },
        where:{
          active: true,
          profile: 'cdt',
        },
        include: [
          {
            model: app.models.tickets,
            as: 'resposibleFor',
            where: {
              finished: false,
            },

            attributes: ['id', 'title', 'description', 'category' ,'user_requester', 'start_date', 'end_date', 'finished'],
            include: [
              {
                model: app.models.users,
                as: 'user_req',
                attributes: ['id','name']
            },
            ]
          }
        ]
      });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" });
    }
  });

};
