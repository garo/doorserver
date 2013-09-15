var doorserver = require('../doorserver');

/**
 * Called when an input driver has read a key access token.
 *
 * This function does all the business logic what happens when an user tries to enter
 * the system with his authentication token.
 *
 * @param token_packet
 * @param cb
 */
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
            doorserver.services.door.openDoorForAMoment(token_packet.door_id);
            exports.logAllowedUser(user, token_packet.door_id, token_packet.token, cb);

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
  doorserver.repositories.logRepository.logDeniedUser((user ? user.id : null), door_id, token, reason, cb);
};

exports.logAllowedUser = function(user, door_id, token, cb) {
  console.log("User", user, "with token", token, "access was granted to door", door_id);
  doorserver.repositories.logRepository.logAllowedUser(user.id, door_id, token, cb);
};
