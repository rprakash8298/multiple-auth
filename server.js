const express = require('express');
const passport = require('passport');
const session = require('express-session')
require('./DBconnection/mongoose')
const User = require('./Schema/user')
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const { Passport } = require('passport');
const app = express();


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('local', new LocalStrategy(
  function(username, password, done) {
    console.log('username, password', username, password);
    if (username !== 'admin') {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (password !== 'passwd') {
      return done(null, false, { message: 'Incorrect password.' });
    }
    console.log('LocalStrategy OK');
    return done(null, {
      username: 'admin'
    });
  }
));

passport.use('facebook', new FacebookStrategy({
    clientID: 'Your Client id of facebook',
    clientSecret: 'Your Client secret of facebook',
    callbackURL: "http://localhost:2300/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // console.log( profile);
     User.findOne({ profileId: profile.id }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          profileId: profile.id,
          name: profile.displayName,
          email: profile.emails,
          photos: profile.profileUrl,
          provider:profile.provider
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("user saved ...");
            done(null, user);
          }
        });
      }
    });
  }
));


passport.use(new GoogleStrategy({
    clientID: 'Your Client id of google',
    clientSecret: 'Your Client secret of google',
    callbackURL: "http://localhost:2300/auth/google/callback"
  },
  function (accessToken, refreshToken, profile, done) {
     User.findOne({ profileId: profile.id }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          profileId: profile._json.sub,
          name: profile._json.name,
          email: profile._json.email,
          photos: profile._json.picture,
          provider:profile.provider
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("user saved ...");
            done(null, user);
          }
        });
      }
    });
  }
));

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
  secret: 'multipleauth',
  saveUninitialized: true,
  resave: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('home.ejs', {user:req.user})
})

app.get('/profile',ensureAuthenticated, (req, res) => {
    res.render('profile.ejs')
})

app.get('/login/google', passport.authenticate('google', { scope: ['openid email profile'] }))

  app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' } ),
    function (req, res) {
    res.redirect('/profile');
    }
  );

 app.get('/login', passport.authenticate( 'facebook', {scope:'email'}));
  
  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successReturnToOrRedirect: '/profile',
    failureRedirect: '/'
  }));


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

const port = process.env.PORT || 2300
app.listen(port, () => {
    console.log(`http:raviPrakash.com ${port}`)
})


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}