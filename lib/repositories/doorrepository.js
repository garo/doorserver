var doorserver = require('../doorserver');

exports.findDoorById = function (door_id, cb) {
  doorserver.repositories.mysql.fetchHandle("data", function (err, handle) {
    handle.query("SELECT * FROM doorserver_doors WHERE id = ?", [door_id], function (err, rows) {
      if (err) {
        cb(err);
        return;
      }

      if (rows.length === 0) {
        cb(null, null);
        return;
      }

      cb(null, new doorserver.models.Door(rows[0]));
    });
  });

};

