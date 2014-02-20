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

      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function (door) {
        opened_door_id = door.id;
      });

      var isUserAllowedToOpenDoor = sinon.stub(doorserver.services.security, 'isUserAllowedToOpenDoor', function (user, door, cb) {
        assert.equal(door.id, 1002);
        cb(null, true); // true means that user can open the door
      });

      var findDoorById = sinon.stub(doorserver.repositories.doorRepository, 'findDoorById', function (door_id, cb) {
        cb(null, new doorserver.models.Door({id : 1002, doorname : "Front door"}));
      });

      var logAllowedUser = sinon.stub(doorserver.services.securityDoorTokenProcessor, 'logAllowedUser', function (user, door_id, token_packet, cb) {
        cb(null); // false means that user is not allowed to open the door
      });

      doorserver.services.securityDoorTokenProcessor.onTokenRead({token : "mytoken", door_id : 1002}, function () {
        assert.ok(findDoorById.called);
        assert.ok(findUserByToken.called);
        assert.ok(openDoorForAMoment.called, "openDoorForAMoment was not called");
        assert.ok(isUserAllowedToOpenDoor.called, "isUserAllowedToOpenDoor was not called");
        assert.equal(opened_door_id, 1002);
        assert.ok(logAllowedUser.called);
        isUserAllowedToOpenDoor.restore();
        findUserByToken.restore();
        openDoorForAMoment.restore();
        findDoorById.restore();
        logAllowedUser.restore();
        done();
      });
    });

    it("should not open door if user is denied", function (done) {

      var findUserByToken = sinon.stub(doorserver.repositories.userRepository, 'findUserByToken', function (token, cb) {
        cb(null, new doorserver.models.User({id:100, token:"mytoken"}));
      });

      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function () {

      });

      var findDoorById = sinon.stub(doorserver.repositories.doorRepository, 'findDoorById', function (door_id, cb) {
        cb(null, new doorserver.models.Door({id : 1002, doorname : "front door"}));
      });

      var isUserAllowedToOpenDoor = sinon.stub(doorserver.services.security, 'isUserAllowedToOpenDoor', function (user, door, cb) {
        cb(null, false); // false means that user is not allowed to open the door
      });

      var logDeniedUser = sinon.stub(doorserver.services.securityDoorTokenProcessor, 'logDeniedUser', function (user, door, token_packet, reason, cb) {
        assert.equal(door.id, 1002);
        assert.equal(door.doorname, "front door");
        cb(null); // false means that user is not allowed to open the door
      });

      doorserver.services.securityDoorTokenProcessor.onTokenRead({token : "mytoken", door_id : 1002}, function () {
        assert.ok(findUserByToken.called);
        assert.equal(false, openDoorForAMoment.called, "openDoorForAMoment was called, but user was not allowed");
        assert.ok(isUserAllowedToOpenDoor.called, "isUserAllowedToOpenDoor was not called");
        assert.ok(logDeniedUser.called);
        isUserAllowedToOpenDoor.restore();
        findUserByToken.restore();
        openDoorForAMoment.restore();
        findDoorById.restore();
        logDeniedUser.restore();
        done();
      });
    });

  });

  describe("logDeniedUser", function() {
    it("should call logRepository.logDeniedUser", function(done) {
      var logDeniedUser = sinon.stub(doorserver.repositories.logRepository, 'logDeniedUser', function (user_id, door_id, token, reason, cb) {
        assert.equal(100, user_id);
        assert.equal(1000, door_id);
        assert.equal("da token", token);
        assert.equal("error name", reason);
        cb();
      });

      var door = new doorserver.models.Door({id : 1000, doorname : "front door"});
      var user = new doorserver.models.User({id : 100, name : "Mr Smith"});
      doorserver.services.securityDoorTokenProcessor.logDeniedUser(user, door, "da token", "error name", function(err) {
        assert.ifError(err);
        assert.ok(logDeniedUser.called);
        logDeniedUser.restore();
        done();
      });

    });

    it("should send null as user_id if user was undefined", function(done) {
      var logDeniedUser = sinon.stub(doorserver.repositories.logRepository, 'logDeniedUser', function (user_id, door_id, token, reason, cb) {
        assert.equal(null, user_id);
        assert.equal(1000, door_id);
        assert.equal("da token", token);
        assert.equal("error name", reason);
        cb();
      });

      var door = new doorserver.models.Door({id : 1000, doorname : "front door"});
      doorserver.services.securityDoorTokenProcessor.logDeniedUser(null, door, "da token", "error name", function(err) {
        assert.ifError(err);
        assert.ok(logDeniedUser.called);
        logDeniedUser.restore();
        done();
      });

    });

  });


  describe("logAllowedUser", function() {
    it("should call logRepository.logAllowedUser", function(done) {
      var logAllowedUser = sinon.stub(doorserver.repositories.logRepository, 'logAllowedUser', function (user_id, door_id, token, cb) {
        assert.equal(100, user_id);
        assert.equal(1000, door_id);
        assert.equal("da token", token);
        cb();
      });

      var door = new doorserver.models.Door({id : 1000, doorname : "front door"});
      var user = new doorserver.models.User({id : 100, name : "Mr Smith"});
      doorserver.services.securityDoorTokenProcessor.logAllowedUser(user, door, "da token",function(err) {
        assert.ifError(err);
        assert.ok(logAllowedUser.called);
        logAllowedUser.restore();
        done();
      });

    });
  });
});