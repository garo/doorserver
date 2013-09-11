
var settings = {};

settings.mysql = {
  host : "localhost",
  user : "doorserver",
  password : "doorserver",
  database : "doorserver_test"
};

exports.get = function(key) {
  return settings[key];
};
