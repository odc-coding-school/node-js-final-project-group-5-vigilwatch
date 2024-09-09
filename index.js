const express = require("express");
const app = express();
const PORT = 3000;
const ejs = require("ejs");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.get("/report", (req, res) => {
	res.render("report.ejs");
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
