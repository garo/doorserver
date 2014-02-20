var doorserver = require('../doorserver');

/**
 * SecurityDoorTokenProcessor. Used to process tokens when the server is used to protect
 * security doors.
 *
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

    doorserver.repositories.doorRepository.findDoorById(token_packet.door_id, function (err, door) {
      if (err) {
        console.error((new Date().toISOString()) + " Error getting door", token_packet.door_id, "due to database error", err);
        return;
      }

      if (!door) {
        console.warn((new Date().toISOString()) + " Could not find door", token_packet.door_id);
        cb(new Error("Could not find door " + token_packet.door_id));
        return;
      }

      if (user) {
        doorserver.services.security.isUserAllowedToOpenDoor(user, door, function (err, canOpen) {
          if (err) {
            cb(err);
            return;
          }

          if (canOpen) {
            doorserver.services.door.openDoorForAMoment(door);
            exports.logAllowedUser(user, door, token_packet.token, cb);
          } else {
            exports.logDeniedUser(user, door, token_packet.token, "not allowed to open door (no valid user group)", cb);
          }
        });
      } else {
        exports.logDeniedUser(user, door, token_packet.token, "unknown user or token or disabled user", cb);
      }
    });
  });
};

exports.logDeniedUser = function(user, door, token, reason, cb) {
  console.log((new Date().toISOString()) + " User", user, "with token", token, "access was denied to door", door.doorname, "reason:", reason);
  doorserver.repositories.logRepository.logDeniedUser((user ? user.id : null), door.id, token, reason, cb);
};

exports.logAllowedUser = function(user, door, token, cb) {
  console.log((new Date().toISOString()) + " User", user, "with token", token, "access was granted to door", door.doorname);
  doorserver.repositories.logRepository.logAllowedUser(user.id, door.id, token, cb);
};
