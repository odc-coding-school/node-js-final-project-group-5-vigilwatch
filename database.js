const mysql2 = require('mysql2');


const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "hubwatch"
})



db.connect(function(err){
    if(err) return console.log(err.message);
    db.query("CREATE DATABASE IF NOT EXISTS hubwatch", function(err) {
        if(err) return console.log(err.message);
        return console.log('database is created successfully');
    })
    return console.log('database connected');
})






module.exports = db;
