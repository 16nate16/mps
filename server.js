/**
 * Created by rford1 on 12/24/14.
 */

var express         = require('express'),
    hbs             = require('express-hbs'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    favicon         = require('serve-favicon'),
    router          = express.Router(),
    serveStatic     = require('serve-static'),
    env             = process.env.NODE_ENV || 'development';
    app             = express();



//middleware
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/public/templates');
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(serveStatic(__dirname + '/public'));


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(router);

app.route('/').get(function (req, res) {
    console.log("render index");
    res.render('index', {title:"yoyo"})
})

app.route('/test').get(function (req, res) {
    console.log("render index");
    res.render('test', {title:"tet"})
})



app.listen(app.get('port'), function(){
    console.log("MPS server listening on port " + app.get('port'));
});