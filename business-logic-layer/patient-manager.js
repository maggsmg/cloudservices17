const userValidator = require('./user-validator')
const patientRepository = require('../data-access-layer/patient-repository')

exports.create = function(userCreate, idCreated, callback){

	userValidator.validate(userCreate, function(userCreates, errors){
		if(errors.length == 0){
				patientRepository.addPatient(userCreate, idCreated, callback);
		}else{
			callback(null, errors)
		}
	})

}

exports.createRegister = function (register, patientId, callback) {

	patientRepository.getUserById(patientId, function(user_exists,err2){
		if (user_exists == null){
			callback ('Patient does not exist', err2)
		}

		else{
			patientRepository.addRegister(register, patientId, callback);
		}

	});
}

exports.allInfo = function(id, callback){
	//console.log('entro a la funcion')
	patientRepository.getPatient(id, callback);
	//callback(null,errors);
}

exports.allPatients = function(callback){

	patientRepository.getAllPatients(callback);
}

exports.onePatient = function(patientId, callback){
	patientRepository.getUserById(patientId, function(user_exists,err2){
		if (user_exists == null){
			callback ('Patient does not exist', err2)
		}

		else{
			patientRepository.getThisPatient(patientId, callback);
		}

	});//patientRepository.getThisPatient(id, callback);
}

exports.deleteRegister = function(registerId, callback){
	patientRepository.deleteRegister(registerId, callback);
}
