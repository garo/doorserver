
var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('userrepository', function() {

  describe("findUserById", function() {
    it("should find user by id from mysql database", function (done) {
      doorserver.repositories.userRepository.findUserById(100, function (err, user) {
        assert.equal(user.id, 100);
        assert.equal(user.name, "User owning token named \"mytoken\"");
        done();
      })
    });

    it("should return null if user was not found", function (done) {
      doorserver.repositories.userRepository.findUserById(2, function (err, user) {
        assert.ifError(err);
        assert.equal(null, user);
        done();
      });
    });

    it("should return null if user was disabled", function (done) {
      doorserver.repositories.userRepository.findUserById(101, function (err, user) {
        assert.ifError(err);
        assert.equal(null, user);
        done();
      });
    });
  });

  describe("findUserByToken", function() {
    it("should find user by token from mysql database", function (done) {
      doorserver.repositories.userRepository.findUserByToken("mytoken", function (err, user) {
        assert.equal(user.id, 100);
        assert.equal(user.name, "User owning token named \"mytoken\"");
        done();
      })
    });

    it("should return null if user was not found", function (done) {
      doorserver.repositories.userRepository.findUserByToken("notfound", function (err, user) {
        assert.ifError(err);
        assert.equal(null, user);
        done();
      });
    });

    it("should return null if token was disabled", function (done) {
      doorserver.repositories.userRepository.findUserByToken("disabled_token", function (err, user) {
        assert.ifError(err);
        assert.equal(null, user);
        done();
      });
    });
  });

  describe("findAllGroupsForUserForDoor", function () {
    it("should find allowed door", function (done) {
      var user_id = 100;
      var door = {
        id : 1000,
        name : "door name"
      };
      doorserver.repositories.userRepository.findAllGroupsForUserForDoor(user_id, door, function (err, results) {
        assert.ifError(err);
        assert.ok(results);
        assert.equal(results[0].groupid, 10);
        assert.equal(results[0].doorid, 1000);
        assert.equal(results[0].doorname, "Etuovi");
        assert.equal(results[0].groupname, "Workers");
        done();
      });
    });
  });

});

