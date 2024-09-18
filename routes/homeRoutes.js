const express = require("express");
const router = express.Router();
const db = require('../database');

router.get("/", (req, res) => {
	console.log("req.session.user", req.session.user);

	const user = req.session.user || null;
	res.render("home", { user, isRegistered: !!req.session.user });
});


router.get("/members", (req, res)=>{
	let user = req.session.user
	console.log(user);
	
	if(!user){
		res.status(400).json("Session Expired")
		return;
	}else{
		const query = `SELECT * from users INNER JOIN room ON(users.room_id = room.room_id) WHERE users.room_id = ?`;
		
		db.query(query, [user.room_id], (err, result)=>{

			if (err) return res.json(err.message);

			res.json(result) 
		})
	
	}

})

module.exports = router;
