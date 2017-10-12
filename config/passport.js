const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const userManager = require('../business-logic-layer/user-manager');
const patientManager  = require('../business-logic-layer/patient-manager');

const jwt = require('jsonwebtoken');
const config = require('../config/config');
// ------- GOOGLE AUTHENTICATION ---------
// _______ PASSPORT CONFIG ________
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
        console.log('serializing');
    done(null, user.google_id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    userManager.findOneGoogleUser(id, function(err, user) {
        console.log('Des Serializing');
        if (!user)
          done(null, null);
        else
        done(err, user);
    });
});

// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
passport.use(new GoogleStrategy({
    clientID: '61870319209-v0pq2tpg7ech4rg54a1ojg3ofi49dblt.apps.googleusercontent.com',
    clientSecret: 'VSDPynDg9-8X78DHAyXLjEm-',
    callbackURL: 'http://127.0.0.1:8080/auth/google/callback'
},
function(token, refreshToken, profile, done) {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
         console.log('----------token---------------------');
         console.log(token);
        // console.log('----------refreshToken--------------');
        // console.log(refreshToken);
        // console.log('----------profile------------------');
        // console.log(profile);
        // console.log('----------done--------------------');
        // console.log(done);
        // try to find the user based on their google id
        userManager.findOneGoogleUser( profile.id , function(err, user) {
          console.log('finding google user');
            if (err)
                return done(err);
            if (user) {
                // if a user is found, log them in
                console.log('Google User Logged!');

                var token2 = jwt.sign({
                  email: user.email,
                  password: user.password_token
                }, config.secret, { expiresIn: 60 * 60 });
                console.log(token2);
                user.token = token2;
                console.log(user);
                return done(null, user);
            } else {
                // if the user isnt in our database, create a new user
                console.log('*****************Registrar Nuevo Usuario de Google*****************************')
                userToSave = {
                  'name'      :   profile.displayName,
                  'role'      :   '',
                  'email'     :   profile.emails[0].value,
                  'password'  :   '',
                  'google_id' :   profile.id,
                  'token'     :   token
                }
                userManager.createGoogleUser(userToSave, function(userCreated, err){
                  if (err) throw err;


                  console.log('Usuario Google Creado:');
                  console.log(userCreated);

                  return done(null, userCreated);

                });

            }
        });
    });

}));
