var assert = require('assert');
var sinon = require('sinon');

var doorserver = require('../../lib/doorserver');

describe('security', function () {

  describe("isUserAllowedToOpenDoor", function () {
    it("should allow to open door if user belongs to a group", function (done) {

      var findAllGroupsForUserForDoor = sinon.stub(doorserver.repositories.userRepository, 'findAllGroupsForUserForDoor', function (user_id, door, cb) {
        assert.equal(1000, door.id);
        assert.equal("door name", door.doorname);
        cb(null, [
          {groupid:123, doorid:456, groupname:"test group", doorname:"door name"}
        ]);
      });


      var door = new doorserver.models.Door({id:1000, doorname:"door name"});
      var user = new doorserver.models.User({id:100, name:"Garo"});

      doorserver.services.security.isUserAllowedToOpenDoor(user, door, function (err, isAllowed) {
        assert.ok(findAllGroupsForUserForDoor.called);
        assert.ok(isAllowed);
        findAllGroupsForUserForDoor.restore();
        done();
      });

    });
  });

  describe("reportUserSecurityPass", function () {
    it("should report correctly to console.log", function () {
      var msg = "";
      var console_log = sinon.stub(console, 'log', function (message) {
        msg = message;
      });

      var user = new doorserver.models.User({id:100, name:"Garo"});
      var groups = [
        { groupid:10, groupname:"Test group", doorid:1000, doorname:"Front door"},
        { groupid:11, groupname:"Another group", doorid:1001, doorname:"Front door"}
      ];

      doorserver.services.security.reportUserSecurityPass(user, groups);

      // Strip the timestamp off
      var str = msg.substring(msg.indexOf(" "));
      assert.equal(str, " User Garo (100) is allowed to access door \"Front door\" via the following 2 groups: \"Test group\", \"Another group\"");

      console_log.restore();
    });
  });

  describe("reportUserSecurityDenial", function () {
    it("should report correctly to console.log", function () {
      var msg = "";
      var console_log = sinon.stub(console, 'log', function (message) {
        msg = message;
      });

      var user = new doorserver.models.User({id:100, name:"Garo"});
      doorserver.services.security.reportUserSecurityDenial(user);

      // Strip the timestamp off
      var str = msg.substring(msg.indexOf(" "));

      assert.equal(str, " Known user Garo (100) tried to access but was denied");

      console_log.restore();

    });
  });
});

