const config = require("./config");
const jwt = require("jsonwebtoken");
module.exports = (app) => {
  const users = app.models.users;

  const auth = (isOnlyCDT) => (req, res, next) => {

    let token = req.headers["authorization"];

    if (!token) {
      return res.status(401).send({ message: "Token não informado." });
    }
    token = token.replace("Bearer ", "");
    jwt.verify(token, config.jwt.secret, async function (err, decoded) {
      if (err) {
        return res.status(401).send({ message: "Token inválido." });
      }
      let user = await users.findByPk(decoded.id);

      req.userId = user.id;
      req.user = user;
      req.userProfile = user.profile;

      if (!user.active) {
        return res.status(401).send({ message: "Usuário com perfil inativo." });
      }

      // if (user.ip != req.headers['x-real-ip']) {
      //   return res.status(401).send({ message: "Credenciais inválidas! Efetue o login novamente!", ip: user.ip, xRealIp: req.headers['x-real-ip'] });
      // }

      if (isOnlyCDT) {
        if (user.profile == "cdt") {
          next();
        } else {
          return res.status(401).send({ message: "Usuario sem acesso" });
        }
      } else {
        next()
      }
    });
  };

  const hasUser = (req, res, next) => {
    const token = req.headers["authorization"];
    req.hasUser = false;
    if (!token) {
      return next();
    }
    jwt.verify(token, config.jwt.secret, async function (err, decoded) {
      if (err) {
        return next();
      }
      let user = await users.findByPk(decoded.id);
      req.userId = user.id;
      req.user = user;

      req.userProfile = user.profile;
      req.hasUser = true;
      return next();
    });
  };

  return {
    all: auth(false),
    cdt: auth(true),
    hasUser
  };
};
