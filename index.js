const express = require("express");
const app = express();
const PORT = 3000;
const ejs = require("ejs");

app.set("view engine", "ejs");
app.use(express.static("public"));

const homeRoutes = require("./routes/homeRoutes");
const contactRoutes = require("./routes/contactRoutes");

app.use("/", homeRoutes);
app.use("/contact", contactRoutes);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
