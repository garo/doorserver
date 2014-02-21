var doorserver = require('../doorserver');

var request = require('request');

/**
 * GameMachineTokenProcessor. Used to check token to play coin based arcade games.
 *
 * Called when an input driver has read a key access token.
 *
 * This function does all the business logic what happens when an user tries to enter
 * the system with his authentication token.
 *
 * @param token_packet
 * @param cb
 */
exports.onTokenRead = function (token_packet, cb) {

  var settings = doorserver.settings.get("gameMachineTokenProcessor");

  var door = { id : token_packet.door_id };

  var url = settings.url + token_packet.token;
  request(url, function (err, response, body) {
    if (err || response.statusCode != 200) {
      console.error("Error when accessing token url", url);
      cb();
      return;
    }

    var json = null;
    try {
      json = JSON.parse(body);
    } catch (e) {}

    if (json && json.result === true) {
      console.log("User with token", token_packet.token, "was allowed to use machine with door_id", token_packet.door_id);
      doorserver.services.door.openDoorForAMoment(door);
    } else {
      var reason = "";
      if (json && json.msg) {
        reason = json.msg;
      }
      console.log("User with token", token_packet.token, "was denied to use machine with door_id", token_packet.door_id, "reason", reason);
    }

    cb();
  });
};
