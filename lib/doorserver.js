var async = require('async');

exports.repositories = require('./repositories');
exports.models = require('./models');
exports.services = require('./services');
exports.drivers = require('./drivers');


exports.settings = require('../settings');

exports.logger = console;

/**
 * Starts all token reader drivers.
 *
 * - A single hardware has at least one reader, like keyboard, bar code scanner or rfid reader.
 * - A single reader is bound to a single door.
 * - The readers are configured in the settings file.
 *
 * @param cb
 */
exports.startInputListenDrivers = function (cb) {
  exports.startedDrivers = [];
  var inputdrivers = exports.settings.get("inputdrivers");

  // Loop asynchronously thru all drivers
  (function next(i) {
    var cfg = inputdrivers[i];
    var driver = new exports.drivers[cfg.driver](cfg);
    exports.startedDrivers.push(driver);

    // Setup listener for read tokens
    driver.on('token', function (token_packet) {
      exports.services.tokenProcessor.onTokenRead(token_packet, function (err) {
        if (err) {
          console.error("Error on onOokenRead:", err);
        }
      });
    });

    // Kickstart the token reader driver
    driver.start(function (err) {
      if (err) {
        console.error("Error starting input driver", cfg);
        cb(err);
        return;
      }

      // The ugly asynchronous looping code
      if (i > 1) {
        next(i - 1);
      } else {
        cb();
      }
    });
  })(inputdrivers.length - 1);
};


exports.start = function (cb) {

  async.series([
    exports.repositories.mysql.fetchHandle,
    exports.drivers.piface.init,
    exports.services.doorperiod.init,
    exports.startInputListenDrivers
  ], function (err) {
    cb(err);
  });
};

