
var assert = require('assert');
var sinon = require('sinon');

var doorserver = require('../../lib/doorserver');

describe('security', function() {

  describe("isUserAllowedToOpenDoor", function() {
    it("should allow to open door if user belongs to a group", function (done) {

      var findAllGroupsForUser = sinon.stub(doorserver.repositories.userRepository, 'findAllGroupsForUserForDoor', function(user_id, door_id, cb) {
        cb(null, [{groupid : 123, doorid : 456, groupname : "test group", doorname : "test door"}]);
      });


      var door_id = 1000;
      var user = new doorserver.models.User({id : 100, name : "Garo"});

      doorserver.services.security.isUserAllowedToOpenDoor(user, door_id, function (err, isAllowed) {
        assert.ok(findAllGroupsForUser.called);
        assert.ok(isAllowed);
        findAllGroupsForUser.restore();
        done();
      });

    });
  });

  describe("reportUserSecurityPass", function() {
    it("should report correctly to console.log", function() {
      var msg = "";
      var console_log = sinon.stub(console, 'log', function(message) {
        msg = message;
      });

      var user = new doorserver.models.User({id : 100, name : "Garo"});
      var groups = [
        { groupid : 10, groupname : "Test group", doorid : 1000, doorname : "Front door"},
        { groupid : 11, groupname : "Another group", doorid : 1001, doorname : "Front door"}
      ];

      doorserver.services.security.reportUserSecurityPass(user, groups);

      // Strip the timestamp off
      var str = msg.substring(msg.indexOf(" "));
      assert.equal(str, " User Garo (100) is allowed to access door \"Front door\" via the following 2 groups: \"Test group\", \"Another group\"");

      console_log.restore();
    });
  });

  describe("reportUserSecurityDenial", function() {
    it("should report correctly to console.log", function() {
      var msg = "";
      var console_log = sinon.stub(console, 'log', function(message) {
        msg = message;
      });

      var user = new doorserver.models.User({id : 100, name : "Garo"});
      doorserver.services.security.reportUserSecurityDenial(user);

      // Strip the timestamp off
      var str = msg.substring(msg.indexOf(" "));

      assert.equal(str, " Known user Garo (100) tried to access but was denied");

      console_log.restore();

    });
  });
});

