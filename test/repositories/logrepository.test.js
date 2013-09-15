var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('logrepository', function () {
  it("should be able to write logAllowedUser entry to mysql", function (done) {
    doorserver.repositories.logRepository.logAllowedUser(12, 1000, "da token", function (err) {
      assert.ifError(err);

      doorserver.repositories.mysql.fetchHandle("logs", function (err, handle) {
        assert.ifError(err);
        assert.ok(handle);

        handle.query("SELECT * FROM doorserver_logs WHERE user_id = 12 AND door_id = 1000 AND token = 'da token'", function (err, rows) {
          console.log(err);
          assert.ifError(err);
          assert.equal(1, rows.length);
          done();
        });
      });
    });
  });

  it("should be able to write logDeniedUser entry to mysql", function (done) {
    doorserver.repositories.logRepository.logDeniedUser(13, 1001, "da token", "invalid entry", function (err) {
      assert.ifError(err);

      doorserver.repositories.mysql.fetchHandle("logs", function (err, handle) {
        assert.ifError(err);
        assert.ok(handle);

        handle.query("SELECT * FROM doorserver_logs WHERE user_id = 13 AND door_id = 1001 AND token = 'da token' AND reason = 'invalid entry'", function (err, rows) {
          console.log(err);
          assert.ifError(err);
          assert.equal(1, rows.length);
          done();
        });
      });
    });
  });

});