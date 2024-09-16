const mysql2 = require("mysql2");
require("dotenv").config();

const db = mysql2.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

const mysql = require("mysql2");

const createTables = () => {
	const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            address VARCHAR(255),
			profilePic VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;

	// run the queries
	db.query(createUsersTable, (error, result) => {
		if (error) {
			console.error("Error creating users table: ", error);
		} else {
			console.log("Users table created or already exists");
		}
	});
};

createTables();
db.connect(function (err) {
	if (err) return console.log(err.message);
	db.query(`CREATE DATABASE IF NOT EXISTS hubwatch_database `, function (err) {
		if (err) return console.log(err.message);
		return console.log("database is created successfully");
	});
	console.log("database connected");
});

module.exports = db;
