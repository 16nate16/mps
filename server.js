/**
 * Created by rford on 12/24/14.
 */

var express         = require('express'),
    hbs             = require('hbs'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    favicon         = require('serve-favicon'),
    router          = express.Router(),
    serveStatic     = require('serve-static'),
    env             = process.env.NODE_ENV || 'development',
    helpers         = require('./helpers'),
    _               = require("underscore"),
    handlebars      = require('handlebars'),
    fs              = require('fs'),
    path            = require('path')
    expressValidator = require('express-validator'),
    app             = express();



//middleware
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/public/templates');
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(serveStatic(__dirname + '/public'));


app.use(bodyParser.json())
app.use(expressValidator());
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

app.route('/customized-supplement').get(function (req, res) {
    res.render('customized-supplement')
})
app.route('/about').get(function (req, res) {
    res.render('about')
})

app.route('/contact').post(function (req, res) {
    var emailParams = req.body
    var formattedParams = helpers.addLabel(emailParams)
    sendEmail(formattedParams, true)
    res.render('thankyou')
})

app.route('/contact').get(function (req, res) {
    res.render('contact')
})



function createEmailTemplate (params, contactEmail) {
    var file = path.resolve(__dirname, './public/templates/email.html')
    if (contactEmail) {
        file = path.resolve(__dirname, './public/templates/emailContact.html')
    }

    var data = fs.readFileSync(file, {encoding: "utf-8"})
    var template = handlebars.compile(data)
    var html = template({details: params})
    return new Buffer(html).toString()

}


function sendEmail (params, contactEmail) {
    var template = createEmailTemplate(params, contactEmail)
    var email   = require("emailjs");
    var server  = email.server.connect({
        user:    "ryan@myperfectsupplement.com",
        password:"Thinkman1!",
        host:    "smtp.gmail.com",
        port : 465,
        ssl:     true
    });

// send the message and get a callback with an error or details of the message that was sent
    //todo param this rather than use an if
    if (contactEmail){
        server.send({
            text:    "MPS Contact",
            from:    "ryan@myperfectsupplement.com",
            to:      "ryno412@gmail.com, natewhitaker16@gmail.com",
            subject: "MPS Message",
            attachment:
                [
                    {data: template, alternative:true}
                ]

        }, function(err, message) {
            if (err) {
                console.log("EMAIL ERROR")
                //console.log(err)
            }
            else {
                console.log("EMAIL Success!!")
                //console.log(message);
            }

        });

    }
    else {
        server.send({
            text:    "MPS Purchase",
            from:    "orders@myperfectsupplement.com",
            to:      "ryno412@gmail.com, natewhitaker16@gmail.com",
            subject: "BOOM! MPS hittin dog...",
            attachment:
                [
                    {data: template, alternative:true}
                ]

        }, function(err, message) {
            if (err) {
                console.log("EMAIL ERROR")

            }
            else {
                console.log("EMAIL Success!!")

            }

        });
    }
}


app.route('/test').get(function (reg, res) {
    var mock = { supplementName: 'yolo',
        Caffeine: '150mg',
        'Beta-Alanine': '3000mg',
        'L-Arginine': '3000mg',
        'Creatine-Monohydrate': '1000mg',
        'Branch-Chain-Amino-Acids': '1000mg',
        'N-Acetyl-L-Tyrosin': '300mg',
        'L-Glutamine': '6000mg',
        comments: 'jolo' }

    var formattedParams = helpers.addLabel(mock);
    res.render('order-success', {details: formattedParams, name : mock.supplementName})

})

app.route('/order-my-perfect-supplement').post(function (req, res) {
    var queryParams = req.query
    var bodyParams = req.body
    var name = queryParams.supplementName || "My Perfect Supplement"
    var formattedQueryParams = helpers.addLabel(queryParams)

    if (bodyParams) {

        /*field validation */
        req.assert('name', 'a name is required').notEmpty();
        req.assert('street', 'a street is required').notEmpty();
        req.assert('state', 'a state is required').notEmpty();
        req.assert('zip', 'a zip is required').notEmpty();
        req.assert('email', 'a valid email required').isEmail();

        var errors = req.validationErrors();
        if (errors) {
            res.render('order-my-perfect-supplement', {details: formattedQueryParams, name : name, errors: errors})
        }
        else {
            //var stripe = require("stripe")("sk_test_lMcyGuyEPmL3MoAiIXZAEgbm");
            var stripe = require("stripe")("sk_live_vDWEAmVFANdMnja5zv3ZfyAh");

            // Get the credit card details submitted by the form
            var stripeToken = req.body.stripeToken;
            var charge = stripe.charges.create({
             amount: 100, // amount in cents, again
             currency: "usd",
             card: stripeToken,
             description: req.body.email
             }, function(err, charge) {
                 if (err && err.type === 'StripeCardError') {
                 // The card has been declined\
                    console.log("error",err)
                    return res.render('order-error', {message: JSON.stringify(err)})
                 }
                 else {
                    if (charge && charge.id) {
                        bodyParams.chargeId = charge.id
                    }
                    //format data for email
                     delete bodyParams.supplementName
                     var formattedBodyParams = helpers.addLabel(bodyParams);
                     //for some reason the name is getting chopped off after space. todo look into this.
                     formattedBodyParams.unshift({
                         label : "SupplementName",
                         value : _.escape(name)
                     })

                     //Send the email
                     sendEmail(formattedBodyParams, false, name)

                     //use the query params to generate the success page
                     delete queryParams.supplementName
                     var formattedParams = helpers.addLabel(queryParams);
                     //render success page
                     res.render('order-success', {details: formattedParams, name : _.escape(name)})

                 }
             });/*end create charge*/
        }

    }/*end def check on body params*/

    else {
        res.sendStatus(401)
    }
})

app.route('/order-my-perfect-supplement').get(function (req, res) {
    var params = req.query
    var name = params.supplementName || "My Perfect Supplement"
    delete params.supplementName
    var formattedParams = helpers.addLabel(params);
    res.render('order-my-perfect-supplement', {details: formattedParams, name : _.escape(name)})

})



app.listen(app.get('port'), function(){
    console.log("MPS server listening on port " + app.get('port'));
});