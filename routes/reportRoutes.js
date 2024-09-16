const express = require("express");
const router = express.Router();
const registeredUsers = require("../middleware/auth");

router.get("/", registeredUsers, (req, res) => {
	const user = req.session.user || null;

	// If the user is not logged in redirect to login page
	res.render("report", { user });
});

module.exports = router;
