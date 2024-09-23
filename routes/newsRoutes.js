const express = require("express");
const router = express.Router();
const db = require("../database");
const {formatDistanceToNow} = require("date-fns")




router.get("/", (req, res) => {
	const user = req.session.user || null;

	const query = "SELECT * FROM incidents";


	db.query(query, [], (err, result) => {
		if (err) return res.status(500).json(err.message);

		if (result.length === 0) return res.status(409).json("Data error");

		// 		//Othering the news based on the time submitted
		const sortedNews = result.sort((oldNews, newNews) =>
			newNews.incident_date - oldNews.incident_date
		)


		const modifiedNews = sortedNews.map(item => {

			//formating incident date
			const time = new Date(item.incident_date);
			const formatedIncidentDate = formatDistanceToNow(time, {
				addSuffix: true
			});

			//returning the new object 

			return ({
				id: item.id,
				description: item.description,
				incidentDate: formatedIncidentDate,
				location: item.location,
				imagePath: item.image_path,
				incidentType: item.incident_type,
			})
		})



		res.render("news", {modifiedNews, user, isRegistered: !!req.session.user });
	})


});



module.exports = router;
