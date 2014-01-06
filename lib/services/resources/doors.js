var doorserver = require('../../doorserver');

exports.index = function (req, res) {
  var door_settings = Object.keys(doorserver.settings.get("doors"));
  var doors = [];

  (function next(i) {
    if (i < 0) {
      end();
      return;
    }

    var door_id = Number(door_settings[i]);

    doorserver.repositories.doorRepository.findDoorById(door_id, function (err, door) {
      if (err) {
        throw err;
      }
      doors.push(door);

      next(i - 1);
    });


  })(door_settings.length - 1);

  function end() {
    res.send({doors:doors});
  }

};


exports.show = function (req, res, cb) {
  res.json(req.door);
};

exports.edit = function (req, res, cb) {
  console.log("EDIT", req.params);
  var door_id = Number(req.params.door);
  if (!door_id) {
    cb(new Error("Invalid door id " + door_id));
  }

  doorserver.repositories.doorRepository.findDoorById(door_id, function (err, door) {
    if (!door_id) {
      cb(new Error("Unknown door id " + door_id));
    }

    var duration = 40 * 1000;

    doorserver.services.door.openDoorForAMoment(door, duration);
    res.json({action:"door_open_for_a_moment", door:req.params.door, duration_in_ms:duration});
  });
};

exports.load = function (door_id, cb) {
  door_id = Number(door_id);
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
      err = new Error("Invalid door_id");
      err.code = 404;
      cb(err);
      return;
    }

    cb(null, door);
  });
};