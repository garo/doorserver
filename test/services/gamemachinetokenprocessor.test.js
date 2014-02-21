var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');
var http = require('http');

describe('rfid', function () {

  describe("onTokenRead when access is granted", function () {
    var instance;
    before(function (done) {
      instance = http.createServer(
          function (request, response) {
            response.end(JSON.stringify({result: true, msg : "token granted"}));
          }).listen(8312);
      instance.on("listening", function () {
        done();
      });
      instance.on("error", function () {
        console.error("Error while creating http server for testing");
      });
    });

    after(function (done) {
      instance.close();
      done();
    });

    it("Checks token via http", function (done) {
      var opened_door_id = null;

      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function (door) {
        opened_door_id = door.id;
      });

      doorserver.services.gameMachineTokenProcessor.onTokenRead({token:"mytoken", door_id:1002}, function () {
        assert.ok(openDoorForAMoment.called, "openDoorForAMoment was not called");
        assert.equal(opened_door_id, 1002);
        openDoorForAMoment.restore();
        done();
      });
    });
  });

  describe("onTokenRead when access is not granted", function () {
    var instance;
    before(function (done) {
      instance = http.createServer(
          function (request, response) {
            response.end(JSON.stringify({result: false, msg : "token granted"}));
          }).listen(8312);
      instance.on("listening", function () {
        done();
      });
      instance.on("error", function () {
        console.error("Error while creating http server for testing");
      });
    });

    after(function (done) {
      instance.close();
      done();
    });

    it("Checks token via http", function (done) {
      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function (door) {
      });

      doorserver.services.gameMachineTokenProcessor.onTokenRead({token:"mytoken", door_id:1002}, function () {
        assert.equal(false, openDoorForAMoment.called);
        openDoorForAMoment.restore();
        done();
      });
    });
  });

  describe("onTokenRead when server does not respond", function () {
    it("Checks token via http", function (done) {
      var openDoorForAMoment = sinon.stub(doorserver.services.door, 'openDoorForAMoment', function (door) {
      });

      doorserver.services.gameMachineTokenProcessor.onTokenRead({token:"mytoken", door_id:1002}, function () {
        assert.equal(false, openDoorForAMoment.called);
        openDoorForAMoment.restore();
        done();
      });
    });
  });

});