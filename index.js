const express = require('express')
const app = express()
const consign = require('consign');

consign()
    .include("db.js")
    .then("models")
    .then("associations.js")
    .then("middlewares.js")
    .then("boot.js")
    .then("auth.js")
    .then("log.js")
    .then("routes")
    .into(app)