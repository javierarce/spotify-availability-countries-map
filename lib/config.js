var Config, configuration, defaultPort, env;
env = process.env.NODE_ENV || 'development';
defaultPort = 5000;

configuration = {
  development: {
    host: "api.spotify.com",
    port: defaultPort,
    clientID: "",
    clientSecret: "",
    callbackURL: 'http://localhost:5000/callback'
  },
  production: {
    host: "api.spotify.com",
    port: defaultPort,
    clientID: "",
    clientSecret: "",
    callbackURL: 'http://localhost:5000/callback'
  }
};

configuration[env].redirectURL = "http://" + configuration[env].URL + "/callback";

Config = configuration[env];
module.exports.Config = Config;
