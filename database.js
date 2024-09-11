const mysql2 = require('mysql2');
require('dotenv').config()


const db = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME
})


db.connect(function(err){
    if(err) return console.log(err.message);
    db.query(`CREATE DATABASE IF NOT EXISTS hubwatch_database `, function(err) {
        if(err) return console.log(err.message);
        return console.log('database is created successfully');
    })
     console.log('database connected');
})







module.exports = db;
