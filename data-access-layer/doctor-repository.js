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

exports.addDoctor = function(userCreate, idCreated, callback){
	const errors = [];
    var query_string = "INSERT INTO doctors (user_id, hospital, specialty) VALUES (" + "'" + idCreated + "','" + userCreate.hospital + "','" + userCreate.specialty + "');"
    con.query(query_string, function (err, result, fields) {
	    if (err) throw err;
      callback('Doctor Created', errors);
	  });
}

exports.addRegister = function(register, patientId, doctorId, callback){
  const errors =[];

  var query_string = "INSERT INTO doctorRegister (date, patient_id, doctor_id, weight_control, prescription) VALUES ( NOW()," + "'" + patientId + "','" + doctorId + "','" + register.weight_control + "','" + register.prescription + "');"
  var query_string2 = "UPDATE patients SET weight =" + "'" + register.weight_control + "' WHERE id="+ "'" + patientId + "';"

  con.query(query_string, function (err, result, fields) {
    if (err) throw err;
    con.query(query_string2, function (err, result, fields) {
      if (err) throw err;
      callback('Register Created', err);
    });
    //callback('Register Created', err);
  });

}

exports.getDoctor = function(id, callback){
  const errors = [];
	con.query("SELECT * FROM users INNER JOIN doctors ON users.id = doctors.user_id WHERE user_id =" + id, function (err, result, fields) {
  		if (err) throw err;
  		console.log(result);
  		callback(result,errors);
	});
}

exports.getAllDoctors = function(callback){
  const errors = [];
  var query_string = "SELECT * FROM users INNER JOIN doctors ON users.id = doctors.user_id"
  console.log(query_string);
  con.query(query_string, function (err, result, fields) {
      if (err) throw err;
      callback(result,errors);
  });

}

exports.getThis = function(patientId, doctorId, callback){
  const errors = [];
  var query_string = "SELECT * FROM doctorRegister WHERE patient_id =" + patientId + " AND doctor_id =" + doctorId + ";"
  console.log(query_string);
  con.query(query_string, function (err, result, fields) {
      if (err) throw err;
      callback(result,errors);
  });

}

exports.getUserById = function(id, callback){
  var query_string = "SELECT id, user_id FROM doctors WHERE id ='" + id + "';" ;
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

    var query_string = "DELETE FROM doctors WHERE user_id =" + "'" + userId +  "';"
    console.log(query_string);
    con.query(query_string, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        callback('SUCCESS',errors);
    });
}
