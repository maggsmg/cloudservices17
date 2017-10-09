const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const userManager = require('../business-logic-layer/user-manager');

// ------- GOOGLE AUTHENTICATION ---------    
// _______ PASSPORT CONFIG ________
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.google_id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    userManager.findOneGoogleUser(id, function(err, user) {
        done(err, user);
    });
});

// code for login (use('local-login', new LocalStategy))
// code for signup (use('local-signup', new LocalStategy))
// code for facebook (use('facebook', new FacebookStrategy))
// code for twitter (use('twitter', new TwitterStrategy))

// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
passport.use(new GoogleStrategy({
    clientID: '1004659648037-jdq3vntbh1nh7mgljtoprsqgag4p8vvc.apps.googleusercontent.com',
    clientSecret: 'cVksIKu7IS1FrmRwLy6GLcik',
    callbackURL: 'http://127.0.0.1:8000/auth/google/callback'
},
function(token, refreshToken, profile, done) {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
        // console.log('----------token---------------------');
        // console.log(token);
        // console.log('----------refreshToken--------------');
        // console.log(refreshToken);
        // console.log('----------profile------------------');
        // console.log(profile);
        // console.log('----------done--------------------');
        // console.log(done);
        // try to find the user based on their google id
        userManager.findOneGoogleUser( profile.id , function(err, user) {
            if (err)
                return done(err);
            if (user) {
                // if a user is found, log them in
                console.log('Google User Logged!');
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
