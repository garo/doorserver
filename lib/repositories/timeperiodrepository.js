var doorserver = require('../doorserver');

exports.findTimeperiodById = function (timeperiod_id, cb) {
  doorserver.repositories.mysql.fetchHandle("data", function (err, handle) {
    handle.query("SELECT id, name FROM doorserver_timeperiods WHERE id = ?", [timeperiod_id], function (err, rows) {
      if (err) {
        console.error("Error getting timeperiod", err);
        cb(err);
        return;
      }

      if (rows.length === 0) {
        cb(null, null);
        return;
      }

      // Query all rules for this Timeperiod
      handle.query("SELECT id, timeperiod_id, rule, exclude FROM doorserver_timeperiod_rules WHERE timeperiod_id = ?", [timeperiod_id], function (err, rule_rows) {
        if (err) {
          console.error("Error getting timeperiod rules", err);
          cb(err);
          return;
        }

        cb(null, new doorserver.models.Timeperiod(rows[0], rule_rows));
      });
    });
  });

};

