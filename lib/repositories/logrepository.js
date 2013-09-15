var doorserver = require('../doorserver');

exports.logDeniedUser = function(user_id, door_id, token, reason, cb) {
  doorserver.repositories.mysql.fetchHandle("logs", function (err, handle) {
    handle.query("INSERT INTO doorserver_logs (ts, token, user_id, door_id, reason, event) VALUES(now(), ?, ?, ?, ?, 'denied')", [token, user_id, door_id, reason], function (err) {
      if (err) {
        console.error("Error writing log entry to mysql", err);
      }
      cb(err);
    });
  });
};

exports.logAllowedUser = function(user_id, door_id, token, cb) {
  doorserver.repositories.mysql.fetchHandle("logs", function (err, handle) {
    handle.query("INSERT INTO doorserver_logs (ts, token, user_id, door_id, event) VALUES(now(), ?, ?, ?, 'allowed')", [token, user_id, door_id], function (err) {
      if (err) {
        console.error("Error writing log entry to mysql", err);
      }
      cb(err);
    });
  });
};

