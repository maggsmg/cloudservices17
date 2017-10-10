var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cloudservices"
});
con.connect(function(err) {
  if (err) throw err;
});

exports.addUser = function(user, hash, callback){
	const errors = [];
  var inserted_id;
  var query_string = "INSERT INTO users (role, name, email, password) VALUES (" + "'" + user.role + "','" + user.name + "','" + user.email + "','" + hash + "');"
  // console.log(query_string);
  con.query(query_string, function (err, result, fields) {
	   if (err) throw err;
     inserted_id = result.insertId;
	   // console.log(result); //Dejarlo o no dejarlo esta es la cuestion
     callback (result.insertId,'User created', errors);
	  });
}

exports.addGoogleUser = function(user, callback){
  const errors = [];
  var query_string = "INSERT INTO users (role, name, email, password, google_id, token) VALUES (" + "'" + user.role + "','" + user.name + "','" + user.email + "','" + user.password + "','" + user.google_id + "','" + user.token + "');"
  con.query(query_string, function (err, result, fields) {
    if (err) throw err;
    googleUser = {
      'id'            : result.insertId,
      'google_id'     : user.google_id,
      'token'         : user.token,
      'name'          : user.name,
      'email'         : user.email,
      'role'          : user.role
    }
    callback ( googleUser, null);

  });
}

exports.getUserByEmail = function(email, callback){
  var query_string = "SELECT id, role, name, email FROM users WHERE email ='" + email + "';" ;
  // console.log(query_string);
  con.query(query_string, function (err, result, fields) {
      if (err) throw err;
      if (result.length == 1)
        callback(result[0],err);
      else
        callback(null, err);
  });
}

exports.getUserRole = function(id, callback){
  const errors = [];

	//con.connect(function(err) {
		//if (err) throw err;
		con.query("SELECT role FROM users WHERE id =" + id, function (err, result, fields) {
    		if (err) throw err;
    		callback(result,errors);
		});
	//});
}

exports.getPwd = function(email, callback){

	con.query("SELECT password FROM users WHERE email =" + "'" + email + "'", function (err, result, fields) {
  		if (err) throw err;
      if (result.length == 1){
        user = {
          'email'       : email,
          'passwd'      : result[0].password,
          'found'       : true
        }
  		  callback( user ,err);
      }
      else{
        user = {
          'email'       : email,
          'found'       : false
        }
        callback(1, err);
      }
	});

}

exports.updatePwd = function(email, pwd, callback){
  const errors = [];

	//con.connect(function(err) {
		//if (err) throw err;
    var query_string = "UPDATE users SET password =" + "'" + pwd + "' WHERE email="+ "'" + email + "';"
    console.log(query_string);
		con.query(query_string, function (err, result, fields) {
    		if (err) throw err;
    		console.log(result);
    		callback(result,errors);
		});
}

exports.deleteUser = function(id, callback){
  const errors = [];

    var query_string = "DELETE FROM users WHERE id =" + "'" + id +  "';"
    console.log(query_string);
		con.query(query_string, function (err, result, fields) {
    		if (err) throw err;
    		console.log(result);
    		callback('SUCCESS',errors);
		});
}
// exports.getAll = function(callback){
// 	const query = `SELECT id, username, password FROM accounts ORDER BY id`
// 	db.getMany(query, {}, callback)
// }

exports.findOneGoogleUser = function (id, callback){
  const err_notFound = new Error('User not Found');
  con.query("SELECT * FROM users WHERE google_id =" + id +" LIMIT 1", function (err, result, fields) {
      if (err) throw err;
      if (result.length == 1 ){
        googleUser = {
          'id'            : result[0].id,
          'google_id'     : result[0].google_id,
          'name'          : result[0].name,
          'email'         : result[0].email
        }
        callback(err, googleUser);
      }else
        callback(err, 0);
  });
}
