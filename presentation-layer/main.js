
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


app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //
app.use(passport.initialize());
app.use(passport.session());

app.use(express.cookieParser('secret'));
app.use(express.cookieSession()); // Express cookie session middleware
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
  if (pathname == '/' || pathname == 'authenticate' || pathname == '/auth/google' || pathname == '/auth/google/' || pathname == '/auth/google/callback' || pathname == '/authenticate' || pathname == '/user/create' || pathname == '/login') {
    console.log('Route ignored');
    next();
  }
  else if (req.user){
  console.log('User logged by Google')
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

  if (req.user)
   res.send('User Logged: ' + req.user.name + '<br> Email: ' + req.user.email);
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

app.post('/registers/:patientId', function (req,res) {
  var patientId = req.params.patientId;
  const register = req.body;

  patientManager.createRegister(register, patientId, (status, errors) =>{
    if(errors.length == 0){
      console.log('Patient Register Created');
      res.status(200).json([status]);
    }
    else{
      res.status(400).json(["Please try again :("]);
    }

  });
});

app.post('/registers/:patientId/:doctorId', function (req,res) {
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;
  const register = req.body;
  doctorManager.createRegister(register, patientId, doctorId, (status, errors) =>{
    console.log('Doctor Register Created for patient:' + patientId);
    res.status(200).json([status]);
  });
  res.status(400).json(["Please try again :("])
});

//__________PATCHS___________
app.patch('/user/updatePwd', function (req, res) {
  var userpwd = req.body;
  userManager.updatePwd(userpwd.email, userpwd.password, function(update, errors){
    if(errors.length == 0){
      console.log(update);
      res.status(200).json('Password Updated')
    }else{
      res.status(400).json(errors);
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
      //res.send(userInfo) //no se si aqui deba ir res.json o res.send
    }else{
      res.status(400).json('User not found')
    }
  });
});

app.get('/patients' , (req, res)=>{
  //tengo que meter un validator aqui o un typeCheck?
  patientManager.allPatients( (allPatients, errors) =>{

    res.status(200).json(allPatients);
  });
});

app.get('/doctors' , (req, res)=>{
  //tengo que meter un validator aqui o un typeCheck?
  doctorManager.allDoctors( (allDoctors, errors) =>{
    //console.log(typeof allPatients); Para saber que tipo de dato es
    console.log(allDoctors); //Lo debo dejar aqui?
  })
});

app.get('/registers/patients/:patientId', (req, res) =>{
  var patientId = req.params.patientId;
  patientManager.onePatient(patientId, (allRegisters, errors) =>{
    res.status(200).json(allRegisters);
  });
});

app.get('/registers/doctors/:patientId/:doctorId', (req, res) =>{
  var patientId = req.params.patientId;
  var doctorId = req.params.doctorId;
  doctorManager.oneDoctorPatient(patientId, doctorId, (allRegisters, errors) =>{
    res.status(200).json(allRegisters);
  })
})

//__________DELETES___________

app.delete('/user/:id', function (req, res){
  var id = req.params.id;
  userManager.delete(id, function(status, errors){
    res.status(200).json(status);
  });
});

app.delete('/registers/patients/:registerId', function (req, res){
  var registerId = req.params.registerId;
  patientManager.deleteRegister(registerId, function(status, errors){
    res.status(200).json(status);
  });
});

app.delete('/registers/doctors/:registerId', function (req, res){
  var registerId = req.params.registerId;
  doctorManager.deleteRegister(registerId, function(status, errors){
    res.status(200).json(status);
  });
});

app.listen(8000 , () => {
  console.log('Server listening on port 8000');
})
