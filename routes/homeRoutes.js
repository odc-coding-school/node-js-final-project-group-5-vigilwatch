const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	console.log("req.session.user", req.session.user);

	const user = req.session.user || null;
	res.render("home", { user, isRegistered: !!req.session.user });
});

module.exports = router;
