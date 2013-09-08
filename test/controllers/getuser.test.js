
var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('users.get', function() {

	it("should be able to construct itself", function() {
		var cntr = doorserver.controllers.getuser;
		assert.ok(cntr);
	});

  it("should try to find user by id", function (done) {
    sinon.stub(doorserver.repositories.userRepository, 'findUserById', function(id, logger, cb) {
      cb(null, new doorserver.models.User({_id: 'existing_id'}));
    });

    done("not implemented");
  });

});

