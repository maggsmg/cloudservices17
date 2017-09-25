const userValidator = require('./user-validator')
const userRepository = require('../data-access-layer/user-repository')

exports.create = function(user, callback){

	userValidator.validate(user, function(user, errors){
		if(errors.length == 0){
			userRepository.addUser(user, callback);
		}else{
			callback(null, errors)
		}
	})

}

exports.retrieve = function(id, callback){
	//console.log('entro a la funcion')
	userRepository.getPatient(id, callback);
	//callback(null,errors);
}
