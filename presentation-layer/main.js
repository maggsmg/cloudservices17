
const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const typeCheck = require('type-check').typeCheck;
const userManager = require('../business-logic-layer/user-manager');
const patientManager  = require('../business-logic-layer/patient-manager');
const doctorManager   = require('../business-logic-layer/doctor-manager');
const config = require('../config/config');
const passport = require('passport');
const configurePassport = require('../config/passport');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000; // used to create, sign, and verify tokens
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //
app.use(passport.initialize());
app.use(passport.session());

// ------------ MIDDLEWARE ---------------
app.use((req, res, next) => {
  var now = new Date().toString();
  var url = req.url;
  var pathname = req._parsedUrl.pathname;
  var log = `${pathname}: ${req.method}`;
  console.log(log);

  //The following routes are ignored by middleware
  if (pathname == 'authenticate' || pathname == '/auth/google' || pathname == '/auth/google/' || pathname == '/auth/google/callback' || pathname == '/authenticate' || pathname == '/profile' || pathname == '/user/create' || pathname == '/getGoogleUser/106879306004829508354'|| pathname == '/user/updatePwd') {
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
   res.send('Welcome!');
});

app.get('/login', function (req, res) {
   console.log("login");
   res.send('Login!');
});

app.get('/profile', function (req, res) {
   console.log("profile");
   res.send('Logged in by Google Auth2.0!');
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

app.get('/createGoogleUser', function(req,res){
  userToSave = {
    'name'      :   'Miguel Miramontes',
    'role'      :   'patient',
    'email'     :   'migmira@hotmfail1.com',
    'password'  :   '',
    'google_id' :   4,
    'token'     :   'token'
  }
  userManager.createGoogleUser(userToSave, function(userCreated, err){
    if(err.length == 0){
      console.log('Usuario Creado:');
      console.log(userCreated);
      res.send('Usuario '+ userCreated.name  + ' Creado');
    }else{
      res.status(400).json(errors)
    }
  });
});

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
  userManager.jwtoken(login.email, function(user, err){

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
app.post('/user/create', function (req,res) {
  const userCreate = req.body;
  var role = userCreate.role;
  var expectedStructure = '';

  // IF PATIENT
  if(role === 'patient'){
	  expectedStructure = '{role:String, name: String, email: String, password: String, gender: String, age: String, height: String, weight:String }';
	}
  // IF DOCTOR
  else if (role === 'doctor'){
	  expectedStructure = '{role:String, name: String, email: String, password: String, hospital: String, specialty: String}';
  }
  else{
		res.status(400).json(["invalidRole"])
		return
  }

  if(!typeCheck(expectedStructure, userCreate)){
  		res.status(400).json(["invalidInput"])
  		return
  }

  userManager.create(userCreate, function(err, status){
    res.send(status);
	})

  //res.send();
});

app.post('/user/newPatientRegister/:id', function (req,res) {
  var patientId = req.params.id;
  const register = req.body;

  patientManager.createRegister(register, patientId, (status, errors) =>{
    if(errors.length == 0){
      console.log('Patient Register Created');
      res.send(status); //Como hacer que esto tambien aparezca
    }

  });
});

app.post('/user/newDoctorRegister/:patientId/:doctorId', function (req,res) {
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;
  const register = req.body;
  doctorManager.createRegister(register, patientId, doctorId, (status, errors) =>{
    if(errors.length == 0){
      console.log('Doctor Register Created for patient:' + patientId);
      res.send(status); //Como hacer que esto tambien aparezca
    }

  });
});

//__________PUTS___________
app.patch('/user/updatePwd', function (req, res) {
  var userpwd = req.body;
  userManager.updatePwd(userpwd.email, userpwd.password, function(update, errors){
    if(errors.length == 0){
      //var role = userInfo[0].role;
      console.log(update);
      res.send('Password Updated') //no se si aqui deba ir res.json o res.send
    }else{
      res.status(400).json(errors)
    }
  });
});


//__________GETS___________
app.get('/user/:id', function (req, res) {
	var id = req.params.id;
  userManager.role(id, function(userInfo, errors){
    if(errors.length == 0){
      //console.log('yallegue');
      var role = userInfo[0].role;
      //console.log(role);
      if(role == 'patient'){
        patientManager.allInfo(id, (patientInfo, errors) =>{
          //console.log(patientInfo);
        });
      }
      else if(role == 'doctor'){
        doctorManager.allInfo(id, (doctorInfo, errors) =>{
          //console.log(doctorInfo);
        });
      }
      res.send(userInfo) //no se si aqui deba ir res.json o res.send
    }else{
      res.status(400).json(errors)
    }
  });
});

app.get('/patients' , (req, res)=>{
  //tengo que meter un validator aqui o un typeCheck?

  patientManager.allPatients( (allPatients, errors) =>{
    //console.log(typeof allPatients); Para saber que tipo de dato es
    console.log(allPatients); //Lo debo dejar aqui?
  })
});

app.get('/doctors' , (req, res)=>{
  //tengo que meter un validator aqui o un typeCheck?
  doctorManager.allDoctors( (allDoctors, errors) =>{
    //console.log(typeof allPatients); Para saber que tipo de dato es
    console.log(allDoctors); //Lo debo dejar aqui?
  })
});

app.get('/patientRegisters/:id', (req, res) =>{
  var patientId = req.params.id;
  patientManager.onePatient(patientId, (allRegisters, errors) =>{
    console.log(allRegisters);
    res.send('SUCCESS');
  });
});

app.get('/doctorRegister/:patientId/:doctorId', (req, res) =>{
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;
  doctorManager.oneDoctorPatient(patientId, doctorId, (allRegisters, errors) =>{
    console.log(allRegisters);
    res.send('SUCCESS');
  })
})

//__________DELETES___________

app.delete('/user/delete/:id', function (req, res){
  var id = req.params.id;
  userManager.delete(id, function(status, errors){
    console.log(status);
    res.send(status);
  });
});


app.listen(8000 , () => {
  console.log('Server listening on port 8000');
})
