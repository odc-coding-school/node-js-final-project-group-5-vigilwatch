const express = require("express");
const db = require("../database.js");
const router = express.Router();

router.get("/", (req, res) => {
	const limit = parseInt(req.query.limit) || 30;
	const page = parseInt(req.query.page) || 1;
	const offset = page - 1;

<<<<<<< HEAD
	console.log(limit, page, offset);
=======
const ensureAuthenticated = (req, res, next) => {
	if (req.session.user) {
		return next();
	}
	res.redirect("/login");
};


router.get("/", (req, res)=>{
    const limit = parseInt(req.query.limit) || 30;
    const page = parseInt(req.query.page)|| 1;
    const offset = (page-1);
>>>>>>> 15bb7019c349f2f448e5c211d07f78dc5fb549c6

	const query = "SELECT * FROM location LIMIT ? OFFSET ?";
	db.query(query, [limit, offset], (err, results) => {
		if (err) return res.json(err.message);

<<<<<<< HEAD
		res.json(results);
	});
});

module.exports = router;
=======
    const query = "SELECT * FROM location LIMIT ? OFFSET ?";
    db.query(query, [limit, page], (err, results)=>{
        
        if(err) return res.json(err.message);

       res.json(results) 
    
    })
    
})

module.exports = router;
>>>>>>> 15bb7019c349f2f448e5c211d07f78dc5fb549c6
