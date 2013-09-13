var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('rfid', function () {

  describe("onRFIDTokenRead", function () {
    it("should open door if user is allowed", function (done) {

      var opened_door_id = null;

      var findUserByToken = sinon.stub(doorserver.repositories.userRepository, 'findUserByToken', function (token, cb) {
        cb(null, new doorserver.models.User({id:100, token:"mytoken", name : "Mr Smith"}));
      });

      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function (door_id) {
        opened_door_id = door_id;
      });

      var isUserAllowedToOpenDoor = sinon.stub(doorserver.services.security, 'isUserAllowedToOpenDoor', function (user, door_id, cb) {
        cb(null, true); // true means that user can open the door
      });

      var findDoorById = sinon.stub(doorserver.repositories.doorRepository, 'findDoorById', function (door_id, cb) {
        cb(null, new doorserver.models.Door({id : 1000, doorname : "Istiksen Etuovi"}));
      });


      doorserver.services.tokenProcessor.onTokenRead({token : "mytoken", door_id : 1002}, function () {
        assert.ok(findUserByToken.called);
        assert.ok(openDoorForAMoment.called, "openDoorForAMoment was not called");
        assert.ok(isUserAllowedToOpenDoor.called, "isUserAllowedToOpenDoor was not called");
        assert.equal(opened_door_id, 1002);
        isUserAllowedToOpenDoor.restore();
        findUserByToken.restore();
        openDoorForAMoment.restore();
        findDoorById.restore();
        done();
      });
    });

    it("should not open door if user is denied", function (done) {

      var findUserByToken = sinon.stub(doorserver.repositories.userRepository, 'findUserByToken', function (token, cb) {
        cb(null, new doorserver.models.User({id:100, token:"mytoken"}));
      });

      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function () {

      });

      var isUserAllowedToOpenDoor = sinon.stub(doorserver.services.security, 'isUserAllowedToOpenDoor', function (user, door_id, cb) {
        cb(null, false); // false means that user is not allowed to open the door
      });

      var logDeniedUser = sinon.stub(doorserver.services.tokenProcessor, 'logDeniedUser', function (user, door_id, token_packet, reason, cb) {
        cb(null); // false means that user is not allowed to open the door
      });

      doorserver.services.tokenProcessor.onTokenRead("mytoken", function () {
        assert.ok(findUserByToken.called);
        assert.equal(false, openDoorForAMoment.called, "openDoorForAMoment was called, but user was not allowed");
        assert.ok(isUserAllowedToOpenDoor.called, "isUserAllowedToOpenDoor was not called");
        assert.ok(logDeniedUser.called);
        isUserAllowedToOpenDoor.restore();
        findUserByToken.restore();
        openDoorForAMoment.restore();
        logDeniedUser.restore();
        done();
      });
    });

  });

});