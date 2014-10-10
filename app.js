var 
Config = require("./lib/config").Config,
express = require('express'),
SpotifyWebApi = require('spotify-web-api-node'),
http     = require("http"),
https     = require("https"),
_ = require('underscore'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
methodOverride = require('method-override'),
session = require('express-session'),
passport = require('passport'),
swig = require('swig'),
SpotifyStrategy = require('passport-spotify').Strategy;

var consolidate = require('consolidate');

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the SpotifyStrategy within Passport.
passport.use(new SpotifyStrategy({
  clientID: Config.appKey,
  clientSecret: Config.appSecret,
  callbackURL: Config.callbackURL
},
function(accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function () {
    profile.accessToken = accessToken;
    return done(null, profile);
  });
}));

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.engine('ejs', consolidate.swig);

function getOptions(host, port, method, path, headers) {
  return {
    host: host,
    port: port,
    method: method,
    path: path,
    headers: _.extend({
      "Content-Type": "application/json"
    }, headers)
  };
}

function get(res, options) {
  return https.request(options, function(resp) {
    var data;
    data = "";
    resp.on("data", function(chunk) {
      return data += chunk;
    });
    return resp.on("end", function() {
      res.writeHead(resp.statusCode, {
        "Content-Type": "application/json"
      });
      res.write(data);
      return res.end();
    });
  }).end();
}

function getAlbums(req, res) {
  var options;
  console.log(req.user.accessToken)

  options = getOptions(Config.host, 443, "GET", "/v1/me/tracks/", {
    Authorization: "Bearer " + req.user.accessToken
  });

  return https.request(options, function(resp) {
    var data;
    data = "";
    resp.on("data", function(chunk) {
      return data += chunk;
    });
    return resp.on("end", function() {
      res.writeHead(resp.statusCode, {
        "Content-Type": "application/json"
      });
      res.write(data);
      return res.end();
    });
  }).end();
}


app.get('/albums', function(req, res){
  res.render('albums', { user: req.user });
});

app.get('/get/albums', function(req, res){
  if (req.user) {
    getAlbums(req, res);
  }
});

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// GET /auth/spotify
app.get('/auth/spotify', passport.authenticate('spotify', {scope: 'user-library-read user-read-email'}), function(req, res){});

// GET /auth/spotify/callback
app.get('/callback', passport.authenticate('spotify', { failureRedirect: '/login' }), function(req, res) { res.redirect('/'); });

port = process.env.PORT || Config.port;
server = app.listen(port, function() {
  return console.log("Listening on " + port);
});

// Route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
