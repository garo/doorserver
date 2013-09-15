var async = require('async');

/**
 * This file servers as the base of a pseudo-namespace called "doorserver".
 * All models, repositories, services and drivers are attached to this namespace
 * in a hierarchy fashion.
 *
 * This starts as this file requires and exports the sub-namespaces:
 * "repositories", "models", "services" and "drivers" from their respective
 * directories. These directories each have an index.js file, which will export
 * their files into the directory namespace.
 *
 * This results in a namespace which can be accessed from all parts of the progarm
 * (and outside by simple requiring this file). Example:
 *
 * Init: var doorserver = require('../lib/doorserver');
 * Usage example: var user = new doorserver.models.User(...);
 * Usage example: doorserver.services.door.openDoor(...);
 *
 *
 * NAMESPACES AND THEIR FUNCTIONS
 *
 * - Models: Contains both very simple data holders for database objects AND
 *   self sufficient systems that does a simple business rules (timeperiod). They
 *   should not access nor depend other parts of the system.
 *
 * - Repositores: Contains all code that accesses the underlying database.
 *   The repositories are not a complete ORM model, but more of a set of specialized
 *   data access functions. This allows to benefit from complex SQL queries that
 *   query only the required data in as small amount of queries as it's possible.
 *
 * - Services contains subsystems and also actual business logic.
 *
 * - Drivers contains code to interact with physical hardware like rfid readers
 *   and the PiFast digital io expansion board.
 *
 */

exports.repositories = require('./repositories');
exports.models = require('./models');
exports.services = require('./services');
exports.drivers = require('./drivers');

exports.settings = require('../settings');

exports.start = function (cb) {
  async.series([
      function(cb) {
        exports.repositories.mysql.fetchHandle("data", cb);
      },
      function(cb) {
        exports.repositories.mysql.fetchHandle("logs", cb);
      },
    exports.drivers.piface.init,
    exports.services.doorperiod.init,
    exports.startInputListenDrivers
  ], function (err) {
    cb(err);
  });
};



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

