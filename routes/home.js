module.exports = app => {
  const jwt = app.auth;
  app.get('/home', jwt.all, async (req, res) => {
    try {
      return res.status(200).json({ message: "OK" })
    } catch (error) {
      return res.status(400).json(error)
    }
  })
}