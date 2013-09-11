var doorserver = require('../doorserver');

exports.isUserAllowedToOpenDoor = function (user, door_id, cb) {

  doorserver.repositories.userRepository.findAllGroupsForUserForDoor(user.id, door_id, function (err, groups) {

    if (groups.length > 0) {
      exports.reportUserSecurityPass(user, groups);
      cb(null, true);
    } else {
      exports.reportUserSecurityDenial(user);
      cb(null, false);
    }

  });


};

exports.reportUserSecurityPass = function(user, groups) {
  var groupnames = "";
  for (var i = 0; i < groups.length; i++) {
    groupnames += "\"" + groups[i].groupname + "\", ";
  }
  groupnames = groupnames.substring(0, groupnames.length - 2);
  console.log("User " + user.name + " (" + user.id + ") is allowed to access door \"" + groups[0].doorname + "\" via the following " + groups.length + " group" + (groups.length > 1 ? "s: " : ": ") + groupnames);

};

exports.reportUserSecurityDenial = function(user) {
  console.log("Known user " + user.name + " (" + user.id + ") tried to access but was denied");

};
