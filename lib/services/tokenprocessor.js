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
          doorserver.repositories.doorRepository.findDoorById(token_packet.door_id, function (err, door) {
            if (err) {
              console.error("Error getting door", token_packet.door_id, "due to database error", err);
              return;
            }

            if (!door) {
              console.warn("Could not find door", token_packet.door_id);
              return;
            }
            console.log("Going to open door", door, "for user", user, "with token", token_packet.token);
            doorserver.services.door.openDoorForAMoment(token_packet.door_id);

            cb();
          });
        } else {
          exports.logDeniedUser(user, token_packet.door_id, token_packet.token, "not allowed to open door", cb);
        }
      });
    } else {
      exports.logDeniedUser(user, token_packet.door_id, token_packet.token, "unknown user or token", cb);
    }
  });

};

exports.logDeniedUser = function(user, door_id, token, reason, cb) {
  console.log("User", user, "with token", token, "access was denied to door", door_id, "reason:", reason);
  cb();
};
