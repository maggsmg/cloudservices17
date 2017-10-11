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

exports.addPatient = function(userCreate, idCreated, callback){
	const errors = [];
  var query_string = "INSERT INTO patients (user_id, gender, age, weight, height) VALUES (" + "'" + idCreated + "','" + userCreate.gender + "','" + userCreate.age + "','" + userCreate.weight + "','" + userCreate.height + "');"
  con.query(query_string, function (err, result, fields) {
    if (err) throw err;
    callback('Patient Created', errors);
  });
}

exports.addRegister = function(register, patientId, callback){
  const errors =[];
  var query_string = "INSERT INTO patientRegister (date, patient_id, sugar_level, blood_pressure, insulin_intake, foot_pic) VALUES ( NOW()," + "'" + patientId + "','" + register.sugar_level + "','" + register.blood_pressure + "','" + register.insulin_intake + "','" + register.foot_pic + "');"
  //console.log(query_string);
  con.query(query_string, function (err, result, fields) {
    if (err) throw err;
    callback('Register Created', errors);
  });

}

exports.getPatient = function(id, callback){
  const errors = [];
    //falta quitar password y otros valores que no son relevantes en el get.
		con.query("SELECT * FROM users INNER JOIN patients ON users.id = patients.user_id WHERE user_id =" + id, function (err, result, fields) {
    		if (err) throw err;
    		// console.log(result);
    		callback(result,errors);
		});
	//});
}

exports.getAllPatients = function(callback){
  const errors = [];
  var query_string = "SELECT * FROM users INNER JOIN patients ON users.id = patients.user_id"
  console.log(query_string);
  con.query(query_string, function (err, result, fields) {
      if (err) throw err;
      callback(result,errors);
  });

}

exports.getThisPatient = function(id, callback){
  const errors = [];
  var query_string = "SELECT * FROM patientRegister WHERE patient_id =" + id + ";"
  con.query(query_string, function (err, result, fields) {
      if (err) throw err;
      callback(result,errors);
  });

}

exports.getUserById = function(id, callback){
  var query_string = "SELECT id, user_id FROM patients WHERE id ='" + id + "';" ;
  // console.log(query_string);
  con.query(query_string, function (err, result, fields) {
      if (err) throw err;
      if (result.length == 1)
        callback(result[0],err);
      else
        callback(null, err);
  });
}

exports.delete = function(userId, callback){
  const errors = [];

    var query_string = "DELETE FROM patients WHERE user_id =" + "'" + userId +  "';"
    console.log(query_string);
    con.query(query_string, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        callback('SUCCESS',errors);
    });
}
