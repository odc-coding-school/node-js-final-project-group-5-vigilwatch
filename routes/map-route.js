const express = require("express");
const router = express.Router();
const db = require("../database.js");


router.get('/', async (req, res) => {
    const user = req.session.user || null;
    let query = `SELECT * FROM incidents WHERE status = "confirmed"`;
    
    db.query(query, (err, result) => {
        if (err) return res.status(500).json(err.message);
         
        return res.render("map", {crimes: result, isRegistered: !!req.session.user, user});
    })

})


// router.get('/filter-location', async (req, res) => {
//     const {locationFilter} = req.query;

//     let query = `SELECT * FROM incidents`;

//     // checking if location exist
//     if(locationFilter) {
//         query += ` WHERE location=?`;
//     }
    

//     db.query(query, [locationFilter], (err, result) => {
//         if (err) return res.status(500).json(err.message);

//         if(result.length === 0) return res.json("Search result not found");
//         res.json(result)
        
//         return res.render("map", {crimes: result})
//     })

// })




module.exports = router;
