var mysql = require('mysql');

// Format of the env variable:
// DBName=maggscs17;DBhost=localhost:3306;DBUser=root;DBPass=;

var azureMySQL = process.env.MYSQLCONNSTR_localdb;

var connVars = azureMySQL.split(';');

var dbOptions = {
	dbname : connVars[0].split('=')[1],
	host : connVars[1].split('=')[1],
	user : connVars[2].split('=')[1],
	pass : connVars[3].split('=')[1]
};

// Split port and host
var hostport = dbOptions.host;
hostport = hostport.split(':');
dbOptions.host = hostport[0];
dbOptions.port = hostport[1];




var con = mysql.createConnection({
  host: dbOptions.host,
	port: dbOptions.port,
	user: dbOptions.user,
	password: dbOptions.pass,
	database: dbOptions.dbname
});

con.connect(function(err) {
  if (err) throw err;
});

module.exports = con;
