
var async = require('async');

exports.controllers = require('./controllers');
exports.repositories = require('./repositories');
exports.models = require('./models');
exports.services = require('./services');
exports.drivers = require('./drivers');


exports.settings = require('./settings');

exports.logger = console;

exports.startedDrivers = [];
exports.startInputListenDrivers = function(cb) {
  var inputdrivers = exports.settings.get("inputdrivers");
  (function next(i) {
    var cfg = inputdrivers[i];
    var driver = new exports.drivers[cfg.driver](cfg);
    exports.startedDrivers.push(driver);
    driver.start(function(err) {
      if (err) {
        console.error("Error starting input driver", cfg);
        cb(err);
        return;
      }

      if (i > 1) {
        next(i - 1);
      } else {
        cb();
      }
    });
  })(inputdrivers.length - 1);
};


exports.start = function(cb) {

  async.series([
    exports.repositories.mysql.fetchHandle
  ], function(err) {
    console.log("Doorserver started");
    cb(err);
  });
};

