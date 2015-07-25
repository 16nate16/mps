var braintree = require('braintree');

module.exports = function(app) {

  app.get('/generateBrainTreeClientToken', function(req, res) {
    var gateway = braintree.connect({
      environment:  braintree.Environment.Sandbox,
      merchantId:   '2wbn3sf3wdqhfjxs',
      publicKey:    'wpdddxz568vf93qd',
      privateKey:   '46f31b5587a04ce786da67f1e784aeed'
    });
    gateway.clientToken.generate({}, function (err, response) {
      res.send(response.clientToken);
    });
  });
};
