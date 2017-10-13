
const http = require('http');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const typeCheck = require('type-check').typeCheck;
const userManager = require('../business-logic-layer/user-manager');
const patientManager  = require('../business-logic-layer/patient-manager');
const doctorManager   = require('../business-logic-layer/doctor-manager');
const config = require('../config/config');
const passport = require('passport');
const configurePassport = require('../config/passport');
const multer = require('multer');
const multerAzure = require('multer-azure');
const dateFormat = require('dateformat');
const md5 = require('md5');
const rand = require('../utils/randomInt');

// Azure storage
const upload = multer({
  storage: multerAzure({
    connectionString: "DefaultEndpointsProtocol=https;AccountName=myresourcegroupdiag566;AccountKey=yXoyxdx3R6RfUft4FxgsaWrN2ABNkBiwoJnwzcc4A2cJxDeuAOqeJ1biJHnc7gnI+VgtC7wFzL2cx48GGpzE2g==;EndpointSuffix=core.windows.net",
    account: 'myresourcegroupdiag566',
    key: 'yXoyxdx3R6RfUft4FxgsaWrN2ABNkBiwoJnwzcc4A2cJxDeuAOqeJ1biJHnc7gnI+VgtC7wFzL2cx48GGpzE2g==',
    container: 'demoblockblobcontainer-4a1814a0-aee7-11e7-9b09-910262c10cfa',
    blobPathResolver: function(req, file, callback) {
      var blobPath = generateName(req, file);
      callback(null, blobPath);
    }
  })
});

function generateName(req, file) {
  var name = file.originalname;
  var ext = path.extname(name);
  var newname = md5(dateFormat(new Date(), 'yyyymmddHHMMss') + rand(0, 1000));
  return newname+ext;
}

const app = express();
// const port = process.env.PORT || 8000; // used to create, sign, and verify tokens

app.set('superSecret', config.secret); // secret variable
app.use(logger('dev'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //

app.use(express.cookieParser('secret'));
app.use(express.cookieSession()); // Express cookie session middleware
app.use(passport.initialize());
app.use(passport.session());

// ------------ MIDDLEWARE ---------------
app.use((req, res, next) => {
  var now = new Date().toString();
  var pathname = req._parsedUrl.pathname;
  console.log(pathname);
  //The following routes are ignored by middleware
  var ignored_paths = ['/', '/authenticate', '/auth/google', '/auth/google/', '/auth/google/callback', '/user', '/login', '/upload'];

  if(ignored_paths.indexOf(pathname) > -1) {
    console.log('Route ignored');
    next();
  }
  else if (req.user){
    console.log('User logged by Google');
    next();
  }
  else{
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({
          success: false,
          message: 'No token provided.'
      });
    }
  }
});

// ---------------------- ROUTES ---------------------

app.get('/', function (req, res) {
   console.log("Home");
   res.send('Hello world this is the main.js file');
});

app.get('/login', function (req, res) {
   console.log("login");
   res.send('Login!');
});

app.post('/upload', upload.single('imgUpload'), (req, res, next) => {
  // console.log(req.file);
  res.send({success: 'success', blobURI: req.file.url, message: 'Successfully uploaded the image'});
});

app.get('/profile', function (req, res) {

  if (req.user){
    res.send(req.user);
  }
   //res.send('User Logged: ' + req.user.name + '<br> Email: ' + req.user.email);
  else{
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    decoded = jwt.verify(token, app.get('superSecret'));
    console.log(decoded);

    res.send('User Logged: ' + decoded.name + '\nEmail: ' + decoded.email)
  }

});

app.get('/getGoogleUser/:id', function(req,res){
  userManager.findOneGoogleUser( req.params.id , function(err, user) {
      if (err)
        res.send(err.message)
      if (user)
        res.send(user)
      else
        res.send('User Not Found');
  });
})

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/auth/google/callback',
          passport.authenticate('google', {
                  successRedirect : '/profile',
                  failureRedirect : '/login'
}));


//__________POSTS___________
app.post('/authenticate', function(req, res) {
  var login = req.body;
  userManager.findUserByEmail(login.email, function(user, err){

    if (err) throw err;

    if (!user.found )
      res.json({ success: false, message: 'Authentication failed. User not found.' });

      userManager.verifyPwd(user.passwd, login.password, function(err,result){
        if (err) throw err;

        if (result){
    		    var token = jwt.sign({
    			  email: login.email,
    			  password: user.passwd
    			}, app.get('superSecret'), { expiresIn: 60 * 60 });

    			res.json({
    			  success: true,
    			  message: 'Enjoy your token!',
    			  token: token
    			});
    		}else{
    		  	res.json({
    			  success: false,
    			  message: 'Authentication failed. Wrong password.',
    			  token: token
    			});
    		}
      });

  });
});

//____CREATE NEW USER________
app.post('/user', function (req,res) {
  const userCreate = req.body;
  var role = userCreate.role;
  var expectedStructure = '';

  // IF PATIENT
  if(role === 'patient'){
	  expectedStructure = '{role:String, name: String, email: String, password: String, gender: String, age: Number, height: Number, weight:Number}';
	}
  // IF DOCTOR
  else if (role === 'doctor'){
	  expectedStructure = '{role:String, name: String, email: String, password: String, hospital: String, specialty: String}';
  }
  else{
		res.status(400).json({error: 'error', message: 'Could not create user, invalidRole'})
		return
  }

  if(!typeCheck(expectedStructure, userCreate)){
  		res.status(400).json({error: 'error', message: 'Could not create user, invalidInput'})
  		return
  }

  userManager.create(userCreate, function(err, status){
    res.status(200).json({success: 'success', message: 'User was successfully created'});
	})

});

app.post('/patientRegisters/:patientId', function (req,res) {
  var patientId = req.params.patientId;
  const register = req.body;

  patientManager.createRegister(register, patientId, (status, errors) =>{
    if(errors.length == 0){
      console.log('Patient Register Created');
      res.status(200).json({success: 'success', message: 'Register was successfully created'});
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not create Register'});
    }

  });
});

app.post('/doctorRegisters/:patientId/:doctorId', function (req,res) {
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;
  const register = req.body;
  doctorManager.createRegister(register, patientId, doctorId, (status, errors) =>{
    if(errors == null){
      console.log('Doctor Register Created for patient:' + patientId);
      res.status(200).json({success: 'success', message: 'Register was successfully created'});
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not create Register'});
    }
  });

});

//__________PATCHS___________
app.patch('/user', function (req, res) {
  var userpwd = req.body;
  userManager.updatePwd(userpwd.email, userpwd.password, function(update, errors){
    if(errors.length == 0){
      console.log(update);
      res.status(200).json({success: 'success', message: 'Password was successfully updated.'});
    }else{
      res.status(400).json({error: 'error', message: 'Could not update Password'});
    }
  });
});


//__________GETS___________
app.get('/user/:id', function (req, res) {
	var id = req.params.id;
  userManager.role(id, function(userInfo, errors){
    if(errors.length == 0){
      var role = userInfo[0].role;

      if(role == 'patient'){
        patientManager.allInfo(id, (patientInfo, errors) =>{
          var patient = {
            'user_id': patientInfo[0].user_id,
            'patient_id': patientInfo[0].id,
            'role': patientInfo[0].role,
            'name': patientInfo[0].name,
            'email': patientInfo[0].email,
            'profile_pic': patientInfo[0].profile_pic,
            'age': patientInfo[0].age,
            'gender': patientInfo[0].gender,
            'weight': patientInfo[0].weight,
            'height':patientInfo[0].height
          }
          res.status(200).json(patient);

        });
      }
      else if(role == 'doctor'){
        doctorManager.allInfo(id, (doctorInfo, errors) =>{
          var doctor = {
            'user_id': doctorInfo[0].user_id,
            'doctor_id': doctorInfo[0].id,
            'role': doctorInfo[0].role,
            'name': doctorInfo[0].name,
            'email': doctorInfo[0].email,
            'profile_pic': doctorInfo[0].profile_pic,
            'hospital': doctorInfo[0].hospital,
            'specialty': doctorInfo[0].specialty
          }
          res.status(200).json(doctor);
        });
      }
    }else{
      res.status(400).json({error: 'error', message: 'User not found'})
    }
  });
});

app.get('/patients' , (req, res)=>{
  patientManager.allPatients( (allPatients, errors) =>{
    if(errors.length == 0){
      res.status(200).json(allPatients);;
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not retrieve Patients'});
    }
  });

});

app.get('/doctors' , (req, res)=>{

  doctorManager.allDoctors( (allDoctors, errors) =>{
    if(errors.length == 0){
      res.status(200).json(allDoctors);;
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not retrieve Doctors'});
    }
  })
});

app.get('/patientRegisters/:patientId', (req, res) =>{
  var patientId = req.params.patientId;
  patientManager.onePatient(patientId, (allRegisters, errors) =>{
    if(errors.length == 0){
      res.status(200).json(allRegisters);;
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not retrieve registers'});
    }
  });
});

app.get('/doctorRegisters/:patientId/:doctorId', (req, res) =>{
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;
  doctorManager.oneDoctorPatient(patientId, doctorId, (allRegisters, errors) =>{
    if(errors.length == 0){
      res.status(200).json(allRegisters);;
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not retrieve registers'});
    }
  });
})

//__________DELETES___________

app.delete('/user/:id', function (req, res){
  var id = req.params.id;
  userManager.delete(id, function(status, errors){
    if(errors.length == 0){
      res.status(200).json({success: 'success', message: 'User was successfully deleted'});
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not delete User'});
    }
  });
});

app.delete('/patientRegisters/:registerId', function (req, res){
  var registerId = req.params.registerId;
  patientManager.deleteRegister(registerId, function(status, errors){
    if(errors.length == 0){
      res.status(200).json({success: 'success', message: 'Register was successfully deleted'});
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not delete Register'});
    }
  });
});

app.delete('/doctorRegisters/:registerId', function (req, res){
  var registerId = req.params.registerId;
  doctorManager.deleteRegister(registerId, function(status, errors){
    if(errors.length == 0){
      res.status(200).json({success: 'success', message: 'Register was successfully deleted'});
    }
    else{
      res.status(400).json({error: 'error', message: 'Could not delete Register'});
    }
  });
});

var port = process.env.PORT || 8080;
app.set('port', port);

app.listen(app.get('port'), () => {
  console.log('Server listening on port ' + port);
});
