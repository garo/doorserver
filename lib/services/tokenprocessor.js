var doorserver = require('../doorserver');

exports.onTokenRead = function(token_packet, cb) {

  doorserver.repositories.userRepository.findUserByToken(token_packet.token, function (err, user) {
    if (err) {
      cb(err);
      return;
    }

    if (user) {
      doorserver.services.security.isUserAllowedToOpenDoor(user, token_packet.door_id, function (err, canOpen) {
        if (err) {
          cb(err);
          return;
        }

        if (canOpen) {
          console.log("Going to open door", token_packet, "for user", user);
          doorserver.services.door.openDoorForAMoment(token_packet.door_id);
        }
      });
    }
    cb();
  });

};

