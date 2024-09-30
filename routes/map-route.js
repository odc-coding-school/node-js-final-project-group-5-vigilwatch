const express = require("express");
const router = express.Router();
const db = require("../database.js");
const axios = require("axios");


router.get('/', async (req, res) => {

    const query = `SELECT * FROM incidents`;

    db.query(query, [], (err, result) => {
        if (err) return res.status(500).json(err.message);
        console.log(result);
        

        return res.render("map", {crimes: result})
    })

})



module.exports = router;
