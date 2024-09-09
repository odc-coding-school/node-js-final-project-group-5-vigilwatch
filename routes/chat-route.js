const express = require('express');
const chatRoute = express.Router()


chatRoute.get('/', (req, res)=>{
    res.render('chat')
})

module.exports = chatRoute;