// const express = require("express");
// const router = express.Router();
// const db = require("../database.js");

// // Route I used to fetch incident counts per location
// router.get("/incidents-per-location", async (req, res) => {
// 	const query = `
//         SELECT location, COUNT(*) as incidentCount
//         FROM incidents
//         GROUP BY location
//     `;

// 	try {
// 		const [results] = await db.promise().query(query);
// 		res.json(results);
// 	} catch (err) {
// 		console.error("Error fetching incidents per location: ", err);
// 		res.status(500).json({ error: "Database error" });
// 	}
// });

// // Route I used to fetch incident counts per location for specific incident types
// router.get("/specific-incidents-per-location", async (req, res) => {
// 	const query = `
//         SELECT location, incident_type, COUNT(*) as incidentCount
//         FROM incidents
//         GROUP BY location, incident_type
//     `;

// 	try {
// 		const [results] = await db.promise().query(query);
// 		console.log(results);

// 		res.json(results);
// 	} catch (err) {
// 		console.error("Error fetching specific incidents: ", err);
// 		res.status(500).json({ error: "Database error" });
// 	}
// });

// // Route I used to fetch trends in incidents across locations
// router.get("/incident-trends", async (req, res) => {
// 	const query = `
//         SELECT incident_date as incidentDate, location, COUNT(*) as incidentCount
//         FROM incidents
//         GROUP BY incidentDate, location
//         ORDER BY incidentDate ASC
//     `;

// 	try {
// 		const [results] = await db.promise().query(query);
// 		res.json(results);
// 	} catch (err) {
// 		console.error("Error fetching incident trends: ", err);
// 		res.status(500).json({ error: "Database error" });
// 	}
// });

// // this is our main route
// router.get("/", async (req, res) => {
// 	const user = req.session.user || null;

// 	const incidentsPerLocationQuery = `
//         SELECT location, COUNT(*) AS count
//         FROM incidents
//         GROUP BY location
//     `;

// 	const specificIncidentsQuery = `
//         SELECT incident_type, location, COUNT(*) AS count
//         FROM incidents
//         GROUP BY incident_type, location
//     `;

// 	try {
// 		const [incidentsByLocation] = await db
// 			.promise()
// 			.query(incidentsPerLocationQuery);
// 		const [specificIncidents] = await db
// 			.promise()
// 			.query(specificIncidentsQuery);

// 		console.log(incidentsByLocation);
// 		console.log(specificIncidents);

// 		res.render("analytics", { user, incidentsByLocation, specificIncidents });
// 	} catch (err) {
// 		console.error("Error fetching data for analytics page: ", err);
// 		res.status(500).json({ error: "Database error" });
// 	}
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../database.js");

// Route to fetch incident counts per location
router.get("/incidents-per-location", async (req, res) => {
	const query = `
        SELECT location, COUNT(*) as incidentCount
        FROM incidents
        WHERE status = 'confirmed'  
        GROUP BY location
    `;

	try {
		const [results] = await db.promise().query(query);
		res.json(results);
	} catch (err) {
		console.error("Error fetching incidents per location: ", err);
		res.status(500).json({ error: "Database error" });
	}
});

// Route to fetch incident counts per location for specific incident types
router.get("/specific-incidents-per-location", async (req, res) => {
	const query = `
        SELECT location, incident_type, COUNT(*) as incidentCount
        FROM incidents
        WHERE status = 'confirmed' 
        GROUP BY location, incident_type
    `;

	try {
		const [results] = await db.promise().query(query);
		console.log(results);
		res.json(results);
	} catch (err) {
		console.error("Error fetching specific incidents: ", err);
		res.status(500).json({ error: "Database error" });
	}
});

// Route to fetch trends in incidents across locations
router.get("/incident-trends", async (req, res) => {
	const query = `
        SELECT incident_date as incidentDate, location, COUNT(*) as incidentCount
        FROM incidents
        WHERE status = 'confirmed' 
        GROUP BY incidentDate, location
        ORDER BY incidentDate ASC
    `;

	try {
		const [results] = await db.promise().query(query);
		res.json(results);
	} catch (err) {
		console.error("Error fetching incident trends: ", err);
		res.status(500).json({ error: "Database error" });
	}
});

// This is our main route
router.get("/", async (req, res) => {
	const user = req.session.user || null;

	const incidentsPerLocationQuery = `
        SELECT location, COUNT(*) AS count
        FROM incidents
        WHERE status = 'confirmed' 
        GROUP BY location
    `;

	const specificIncidentsQuery = `
        SELECT incident_type, location, COUNT(*) AS count
        FROM incidents
        WHERE status = 'confirmed'  
        GROUP BY incident_type, location
    `;

	try {
		const [incidentsByLocation] = await db
			.promise()
			.query(incidentsPerLocationQuery);
		const [specificIncidents] = await db
			.promise()
			.query(specificIncidentsQuery);

		console.log(incidentsByLocation);
		console.log(specificIncidents);

		res.render("analytics", { user, incidentsByLocation, specificIncidents });
	} catch (err) {
		console.error("Error fetching data for analytics page: ", err);
		res.status(500).json({ error: "Database error" });
	}
});

module.exports = router;
