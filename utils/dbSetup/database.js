const mysql = require('mysql');

var mysqlpool = {
	connection : mysql.createPool({ 
	    connectionLimit : '50',
	    host:'localhost', 
	    user: 'root',
	    password: '',
	    database : 'projectml', // database name,
	    multipleStatements: true
	})
}

module.exports  = mysqlpool;