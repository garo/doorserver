var doorserver = require('../doorserver');

exports.onRFIDTokenRead = function(token, cb) {

  var door_id = 1;

  doorserver.repositories.userRepository.findUserByToken(token, function (err, user) {
    if (err) {
      cb(err);
      return;
    }

    if (user) {
      doorserver.services.security.isUserAllowedToOpenDoor(user, door_id, function (err, canOpen) {
        if (err) {
          cb(err);
          return;
        }

        if (canOpen) {
          doorserver.services.door.openDoorForAMoment();
        }
      });
    }
    cb();
  });

};

