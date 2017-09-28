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

	patientRepository.addRegister(register, patientId, callback);
}

exports.allInfo = function(id, callback){
	//console.log('entro a la funcion')
	patientRepository.getPatient(id, callback);
	//callback(null,errors);
}

exports.allPatients = function(callback){

	patientRepository.getAllPatients(callback);
}

exports.onePatient = function(id, callback){

	patientRepository.getThisPatient(id, callback);
}
