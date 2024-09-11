const express = require('express');
const chatRoute = express.Router();

const app = express()



chatRoute.get('/', (req, res)=>{
    res.render('chat')
})

chatRoute.post('/', ()=>{

})

module.exports = chatRoute;