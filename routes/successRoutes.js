const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	const msg = req.query.msg || "Your message has been sent!";
	res.render("successEmail", { msg });
});

module.exports = router;
