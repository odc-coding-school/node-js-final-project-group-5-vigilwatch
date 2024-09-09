const mysql = require("mysql");
const dotenv = require("dotenv").config();

const db = mysql.createConnection({
	host: "localhost",
	user: "hubwatch",
	password: "1234",
	database: "database.db",
});

// db.connect(function (err) {
// 	if (err) return console.error(err.message);
// 	return console.log("Database is connected successfully");
// });

const query =
	"CREATE TABLE IF user (id INTERGER AUTO_INCREMENT PRIMARY-KEY, fullname VARCHAR(20), email VARCHAR(20) ,password VARCHAR(20))";

// db.query(query, [], (err) => {
// 	if (err) return console.log(err.message);
// 	return console.log("user table created successful");
// });

module.exports = db;
