var doorserver = require('../../doorserver');

exports.index = function(req, res, cb) {
  var door_settings = Object.keys(doorserver.settings.get("doors"));
  var doors = [];

  (function next(i) {
    if (i < 0) {
      if (cb) {
        end();
      }
      return;
    }

    var door_id = Number(door_settings[i]);

    doorserver.repositories.doorRepository.findDoorById(door_id, function (err, door) {
      if (err) {
        cb(err);
        return;
      }
      doors.push(door);

      next(i - 1);
    });


  })(door_settings.length - 1);

  function end() {
    res.json({doors : doors});
  }

};


exports.show = function(req, res, cb) {
  res.json(req.door);
};

exports.load = function(door_id, cb){
  var door_id = Number(door_id);
  if (!door_id) {
    var err = new Error("Invalid door_id");
    err.code = 406;
    cb(err);
    return;
  }

  doorserver.repositories.doorRepository.findDoorById(Number(door_id), function (err, door) {
    if (err) {
      cb(err);
      return;
    }

    if (!door) {
      var err = new Error("Invalid door_id");
      err.code = 404;
      cb(err);
      return;
    }

    cb(null, door);
  });
};