module.exports = (app) => {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    async function execCommand(command) {
        try {
            const { stdout, stderr } = await execPromise(command);
            if (stderr) {
                return "1"
            }
            return stdout.trim();
        } catch (error) {
            return "1"
        }
    }

    app.get('/systemVersion', async(req, res) => {
        try {
            const backend = await execCommand('sh get_version.sh');
		    const frontend = await execCommand('sh /var/www/cadernos/get_version.sh');
		    const portal = await execCommand('sh /var/www/portal/get_version.sh');
           return res.status(200).json({backend, frontend, portal})
        } catch (erro) {
            return res.status(400).json({message: 'ocorreu um erro na sua solicitação'})

        }
    })
}