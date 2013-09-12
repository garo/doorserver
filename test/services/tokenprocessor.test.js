var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('rfid', function () {

  describe("onRFIDTokenRead", function () {
    it("should open door if user is allowed", function (done) {

      var findUserByToken = sinon.stub(doorserver.repositories.userRepository, 'findUserByToken', function (token, cb) {
        cb(null, new doorserver.models.User({id:100, token:"mytoken"}));
      });

      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function () {

      });

      var isUserAllowedToOpenDoor = sinon.stub(doorserver.services.security, 'isUserAllowedToOpenDoor', function (user, door_id, cb) {
        cb(null, true); // true means that user can open the door
      });


      doorserver.services.tokenProcessor.onTokenRead("mytoken", function () {
        assert.ok(findUserByToken.called);
        assert.ok(openDoorForAMoment.called, "openDoorForAMoment was not called");
        assert.ok(isUserAllowedToOpenDoor.called, "isUserAllowedToOpenDoor was not called");
        isUserAllowedToOpenDoor.restore();
        findUserByToken.restore();
        openDoorForAMoment.restore();
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


      doorserver.services.tokenProcessor.onTokenRead("mytoken", function () {
        assert.ok(findUserByToken.called);
        assert.equal(false, openDoorForAMoment.called, "openDoorForAMoment was called, but user was not allowed");
        assert.ok(isUserAllowedToOpenDoor.called, "isUserAllowedToOpenDoor was not called");
        isUserAllowedToOpenDoor.restore();
        findUserByToken.restore();
        openDoorForAMoment.restore();
        done();
      });
    });

  });

});