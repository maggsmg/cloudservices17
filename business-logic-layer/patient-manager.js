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

// exports.retrieve = function(id, callback){
// 	//console.log('entro a la funcion')
// 	userRepository.getPatient(id, callback);
// 	//callback(null,errors);
// }
