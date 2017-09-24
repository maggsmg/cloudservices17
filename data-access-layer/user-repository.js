var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "maggsmtz",
  password: "",
  database: "c9"
});


exports.addPatient = function(account, callback){
	// db.insert('accounts', ['username', 'password'], account, callback)
	const errors = []

	con.connect(function(err) {
	  if (err) throw err;
	  con.query("SELECT * FROM user", function (err, result, fields) {
	    if (err) throw err;
	    	console.log(result);
			callback(result, errors);
	    	console.log('Aqui entro');
	  });
	});

	// console.log('Aqui entro');
	// callback('JALO', errors);
}


exports.getPatient = function(id, callback){
	con.connect(function(err) {
		if (err) throw err;
		con.query("SELECT * FROM users", function (err, result, fields) {
    		if (err) throw err;
    		console.log(result);
    		callback(result,errors);
		});
	});
}

// exports.getAll = function(callback){
// 	const query = `SELECT id, username, password FROM accounts ORDER BY id`
// 	db.getMany(query, {}, callback)
// }
