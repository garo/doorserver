var doorserver = require('../doorserver');
var restify = require('restify');

module.exports = function (req, res) {

  doorserver.repositories.userRepository.findUserById(req.params.id, function (err, user) {
    if (err) {
      res.send(new restify.InternalError(err));
    } else if (user) {
      res.send(user);
    } else {
      res.send(new restify.ResourceNotFoundError("User " + req.params.id + " not found"));
    }
  });
  

};

