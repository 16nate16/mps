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

function validateFields(fields) {
    return fields
}

function sendEmail () {
    var email   = require("emailjs");
    var server  = email.server.connect({
        user:    "ryno412@gmail.com",
        password:"Thinkman1!",
        host:    "smtp.gmail.com",
        port : 465,
        ssl:     true
    });

// send the message and get a callback with an error or details of the message that was sent
    server.send({
        text:    "i hope this works",
        from:    "<ryno412@gmail.com>",
        to:      "<ryno412@gmail.com>",
        subject: "BOOM MPS Purchase!"
    }, function(err, message) {
        if (err) {
            console.log("EMAIL ERROR")
            console.log(err);
        }
        else {
            console.log("EMAIL Success!!")
            console.log(message);
        }

    });
}


app.route('/order-my-perfect-supplement').post(function (req, res) {
    console.log("yolo")
    console.log(req.body)
    if (req.body && !validateFields(req.body).errors) {
        // Set your secret key: remember to change this to your live secret key in production
        // See your keys here https://dashboard.stripe.com/account
        var stripe = require("stripe")("sk_test_lMcyGuyEPmL3MoAiIXZAEgbm");

        // (Assuming you're using express - expressjs.com)
        // Get the credit card details submitted by the form
        var stripeToken = req.body.stripeToken;

        var charge = stripe.charges.create({
            amount: 2000, // amount in cents, again
            currency: "usd",
            card: stripeToken,
            description: req.body.email
        }, function(err, charge) {
            if (err /*&& err.type === 'StripeCardError'*/) {
                // The card has been declined
               return res.render('order-error', {message: JSON.stringify(err)})
            }
            else {
                console.log("error",err)
                console.log("charge",charge)
                console.log("%%%%%%%%%%%%%%%%%%%")
                sendEmail()
                res.render('order-success', {message:"card Accepted"})
            }

        });
    }
    else {
        res.sendStatus(401)
    }



})

app.route('/order-my-perfect-supplement').get(function (req, res) {
    console.log("$$$$$$$$$$$$$$$");
   // console.log(reg.params);
    console.log(req.query)
    var params = req.query
    var name = params.supplementName || "My Perfect Supplement"
    delete params.supplementName
    var formattedParams = helpers.addLabel(params);
    res.render('order-my-perfect-supplement', {details: formattedParams, name : name})

})



app.listen(app.get('port'), function(){
    console.log("MPS server listening on port " + app.get('port'));
});