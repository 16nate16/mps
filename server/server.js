var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();


app.set('customHost', process.env.CUSTOM_HOST);
process.env.EMAILS_ENABLED = true;
app.set('emailsOn', process.env.EMAILS_ENABLED);

console.log('host set to: ' + app.get('customHost'));
console.log('emails on: ' + app.get('emailsOn'));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
