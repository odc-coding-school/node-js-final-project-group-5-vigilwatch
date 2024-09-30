const express = require("express");
const router = express.Router();
const db = require("../database");
const { formatDistanceToNow } = require("date-fns")
const axios = require('axios');
const cheerio = require("cheerio");


const scrapeNew = async () => {
	const url = "https://www.frontpageafricaonline.com";
	const { data } = await axios.get(url);
	const cheerioInstance = cheerio.load(data);
	const newItemGroup = [];
}



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



		res.render("news", { modifiedNews, user, isRegistered: !!req.session.user });
	})


});


router.get("/:id", (req, res) => {
	const user = req.session.user || null;

	const query = "SELECT * FROM incidents WHERE id = ?";
	const newsId = req.params.id;
	const error = "News not found";

	db.query(query, [newsId], (err, specificNews) => {
		if (err) return res.status(500).json(err.message);

		// if(specificNews.length === 0) return res.status(409).render("singleNew", {error});

		console.log(specificNews);




		res.render("singleNew", { url: `http://localhost:5000/news/${specificNews[0].id}`, specificNews, user, isRegistered: !!req.session.user });
	})

})



module.exports = router;
