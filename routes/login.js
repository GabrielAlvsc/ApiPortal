const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const config = require("../config")


module.exports = app => {
    const users = app.models.users;
    const { secret } = config.jwt;

    app.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            if (username && password) {
                const where = { username };
                const user = await users.findOne({ where })
                if (!user) {
                    return res.status(401).json({ message: "Usuário não encontrado" })
                }
                if (bcrypt.compareSync(password, user.password)) {
                    const payload = { username: user.username, profile: user.profile, id: user.id, name: user.name }
                    const options = {
                        expiresIn: '12h'
                    }
                    await user.update({ ip: req.headers['x-real-ip'] });
                    const token = jwt.sign(payload, secret, options);
                    app.log.register(app.log.actions.login, user.id,
                        `"${user.name}" Logou no sistema com o IP "${req.headers['x-real-ip']}"`,
                        {},);
                    return res.status(201).json({ token, profile: user.profile, name: user.name, changePassword: user.change_password })
                }
            }
            return res.status(401).json({ message: "Usuário ou senha incorretos" })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro para processar sua solicitação" })
        }
    })


    app.get('/login/portal', app.auth.cdt ,async (req, res) => {
        try {
            //extrai o username e password do corpo da requisição = req.body
            const { username, password } = req.params;

            //verifica se o usuario e senha estão presentes. Se não, retorna um erro 400 com a mensagem “Username e password são obrigatórios”.
            if (!username || !password) {
                return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
            }
            //cria um objeto where com a propriedade username
            const where = { username}

            //Usa o método 'findOne' do modelo 'users' para procurar um usuário no banco de dados que corresponda à 'condição where.'
            const user = await users.findOne({ where })

            if (!user) {
                return res.status(401).json({ message: "Usuário não encontrado" })
                //Se o usuário não for encontrado, retorna uma resposta com status 401 (não autorizado) e uma mensagem “Usuário não encontrado”.
            }
            //Compara a senha fornecida com a senha armazenada usando 'bcrypt.compare'
            const isPasswordValid = await bcrypt.compare(password, user.password)
            //Se a seha não coincidir, retorna o erro 401.
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Usuário ou senha incorretos" })
            }
            //Cria um objeto payload com informações do usuário
            const payload = { username: user.username, profile: user.profile, id: user.id, name: user.name }
            //Define opções para o token JWT, incluindo o tempo de expiração de 12 horas
            const options = {
                expiresIn: '12h'
            }
            //cria um IP para o usuário
            await user.update({ ip: req.headers['x-real-ip'] })
            //cria um token JWT para o usuário
            const token = jwt.sign(payload, secret, options);
            //Registra a ação de login no sistemas de logs
            app.log.register(app.log.actions.login, user.id,
                `Usuário "${user.name}" logado no sistema com o IP "${req.headers['x-real-ip']}"`,
                {},);
            //Retorna tudo OK    
            return res.status(201).json({ token, profile: user.profile, name: user.name, changePassword: user.change_password })


        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Ocorreu um erro ao processar sua solicitação" })
        }
    });

};
