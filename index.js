const express = require("express");
const app = express();
const PORT = 3000;
const ejs = require("ejs");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.get('/register', (req, res)=>{
	res.render('register')
})

app.get('/login', (req, res)=>{
	res.render('login')
})

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
