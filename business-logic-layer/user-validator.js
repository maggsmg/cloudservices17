const MIN_USERNAME_LENGTH = 3
const MAX_USERNAME_LENGTH = 10

exports.validate = function(user, callback){
	const errors = []
	
	callback(user, errors); //To Return User without errors
	
	
	// if(user.username.length < MIN_USERNAME_LENGTH){
	// 	errors.push("usernameTooShort")
	// }
	
	// if(MAX_USERNAME_LENGTH < user.username.length){
	// 	errors.push("usernameTooLong")
	// }
	
	// callback(user, errors)
	
}
