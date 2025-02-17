module.exports = app => {
    async function start() {
     try {
         await app.db.authenticate();
         await app.db.sync({alter:false});
         await app.listen(8080, console.log("Servidor rodando na porta 8080"))
     } catch (error) {
         console.error(error)
     }
    }
 
    start();
 }