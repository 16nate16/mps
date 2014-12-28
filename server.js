/**
 * Created by rford1 on 12/24/14.
 */

var express         = require('express'),
    hbs             = require('hbs'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    favicon         = require('serve-favicon'),
    router          = express.Router(),
    serveStatic     = require('serve-static'),
    env             = process.env.NODE_ENV || 'development';
    helpers         = require('./helpers')
    _               = require("underscore")
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
    res.render('index')
})

app.route('/design-your-supplement').get(function (req, res) {
    res.render('design-your-supplement')
})
app.route('/select-customization').get(function (req, res) {
    res.render('select-customization')
})

function addLabel (params) {
    var formattedItems = [];
    for (var prop in params) {
        if (params.hasOwnProperty(prop)) {
            var val = params[prop] ? params[prop] : "N/A"
            formattedItems.push({
                label : helpers.firstLetterUppercase(prop),
                value : _.escape(val)
            })
        }
    }
    return formattedItems;

}



app.route('/order-my-perfect-supplement').get(function (req, res) {
    console.log("$$$$$$$$$$$$$$$");
   // console.log(reg.params);
    console.log(req.query);
    var params = req.query
    var formattedParams = addLabel(params);
        console.log("####")
        console.log(formattedParams)


    res.render('order-my-perfect-supplement')

})



app.listen(app.get('port'), function(){
    console.log("MPS server listening on port " + app.get('port'));
});