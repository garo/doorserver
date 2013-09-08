
var assert = require('assert');
var sinon = require('sinon');
var doorserver = require('../../lib/doorserver');

describe('users.get', function() {

	it("should be able to construct itself", function() {
		var cntr = doorserver.controllers.getuser;
		assert.ok(cntr);
	});

  it("should try to find user by id", function (done) {
    var findUserById = sinon.stub(doorserver.repositories.userRepository, 'findUserById', function(id, logger, cb) {
      cb(null, new doorserver.models.User({_id: 'existing_id'}));
    });

    var req = {
      params : {
        id : 123
      }
    };

    var res = {
      jsonp : function(response) {
        assert.ok(findUserById.called);
        findUserById.restore();
        done();
      }
    };

    doorserver.controllers.getuser(req, res);
  });

});

