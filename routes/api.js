const express = require("express");
const db = require("../database");
const router = express.Router();
const {formatDistanceToNow} = require('date-fns')

//getting login user id, room-id address and profilepic to store in local storage
router.get('/loginuser', (req, res) => {
	//storing the user id as userID from the session
	const userID = req.session.user.id;
	
	//checking if user exists
    if (req.session.user) {
		const query = `
			SELECT users.id, users.room_id, 
				users.profilePic, users.user_address FROM
			users WHERE id = ?`;
	//getting the user if the user exist from login
		db.query(query, [userID], (err, loginUser) => {
			if (err) return res.status(500).json("Error retrevin user info")
	
			if (loginUser.length == 0) return res.status(404).json("User not found");
			return res.status(200).json(loginUser[0])
		})
    }else {
        res.status(404).send("Session expired or User do not exist"); 
    };

})


//getting login user room infomaiton form the room table
router.get('/room', (req, res) => {
	//storing the user room-id as userID from the session
	const roomID = req.session.user.room_id;
	
	//checking if user exists
	if(req.session.user) {
		const query = `SELECT * FROM room WHERE room_id = ?`;
	
		//getting the user room-id if the user exist from login
		db.query(query, [roomID], (err, logInRoom) => {
			if (err) return res.status(500).json("Error retreving user info");

	
			if (logInRoom.length === 0) return res.status(404).json("User room not found");
			return res.status(200).json(logInRoom[0])
		})

	} else {
		res.status(404).json("room do not exist")
	}
})


//fetching the incidents from the incidents table
// router.get("/news", (req, res)=>{
// 	const  query = "SELECT * FROM incidents";


// 	db.query(query, [], (err, result)=>{
// 		if(err) return res.status(500).json(err.message);

// 		if(result.length===0) return res.status(409).json("Data error");
// 		res.render()


// 		//Othering the news based on the time submitted
// 		const sortedNews = result.sort((oldNews, newNews)=>
// 			newNews.incident_date - oldNews.incident_date
// 		)
		

// 		const modifiedNews = sortedNews.map(item=>{

// 			//formating incident date
// 			const time = new Date(item.incident_date);
// 			const formatedIncidentDate = formatDistanceToNow(time, {
// 				addSuffix: true
// 			});

// 			//returning the new object 

// 			return ({
// 				id: item.id,
// 				description: item.description,
// 				incidentDate: formatedIncidentDate,
// 				location: item.location,
// 				imagePath: item.image_path,
// 				incidentType: item.incident_type,
// 			})
// 		})
		
		
// 		// ?return res.status(200).json(modifiedNews)
// 	})

	

// })




// router.get("/news/:id", (req, res)=>{
// 	const  query = "SELECT * FROM incidents WHERE id = ?";
// 	const newsId = req.params.id;
// 	const error = "News not found";

// 	db.query(query, [newsId], (err, specificNews)=>{
// 		if(err) return res.status(500).json(err.message);
		
// 		if(specificNews.length === 0) return res.status(409).render("news", {error})
// 		return res.status(200).json(specificNews)
// 	})

// })

module.exports = router;