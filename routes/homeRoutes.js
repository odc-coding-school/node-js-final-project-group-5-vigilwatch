const express = require("express");
const router = express.Router();
const db = require("../database");

router.get("/", async (req, res) => {
	const notificationCount = req.session.notificationCount || 0; // Get notification count from session
	req.session.notificationCount = 0; // Reset notification count
	const hasAlerted = req.session.hasAlerted || false;

	// Latest news
	const newsId = req.params.id;
	const latestNews = await db.promise().query(
		`SELECT * FROM incidents WHERE created_at >= now() - INTERVAL 3 DAY AND status = "confirmed" ORDER BY created_at DESC LIMIT 4;
	`
	);

	const [news] = await db
		.promise()
		.query("SELECT * FROM news WHERE id = ?", [newsId]);

	const homeMap = await db
		.promise()
		.query(`SELECT * FROM incidents WHERE status = "confirmed"`);

	const user = req.session.user || null;
	res.render("home", {
		user,
		isRegistered: !!req.session.user,
		notificationCount,
		hasAlerted,
		latestNewsFetched: latestNews[0],
		crimes: homeMap,
		isRegistered: !!req.session.user,
	});
});

router.get("/members", (req, res) => {
	let user = req.session.user;
	// console.log(user);

	if (!user) {
		res.status(400).json("Session Expired");
		return;
	} else {
		const query = `SELECT * from users INNER JOIN room ON(users.room_id = room.room_id) WHERE users.room_id = ?`;

		db.query(query, [user.room_id], (err, result) => {
			if (err) return res.json(err.message);

			res.json(result);
		});
	}
});

module.exports = router;
