

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
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressValidator());
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
        user:    "nate@myperfectsupplement.com",
        password:"D3zyn0016",
        host:    "smtp.gmail.com",
        port : 465,
        ssl:     true
    });

// send the message and get a callback with an error or details of the message that was sent
    //todo param this rather than use an if
    if (contactEmail){
        server.send({
            text:    "MPS Contact",
            from:    "nate@myperfectsupplement.com",
            to:      "nate@myperfectsupplement.com",
            subject: "MPS Message",
            attachment:
                [
                    {data: template, alternative:true}
                ]

        }, function(err, message) {
            if (err) {
                console.log("EMAIL ERROR")
                console.log(err)
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
            to:      "nate@myperfectsupplement.com",
            subject: "BOOM!",
            attachment:
                [
                    {data: template, alternative:true}
                ]

        }, function(err, message) {
            if (err) {
                console.log("EMAIL ERROR")
                console.log(err)

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
        comments: 'jolo this is a comment' }

    var formattedParams = helpers.addLabel(mock);
    res.render('order-success', {details: formattedParams, name : mock.supplementName})

})

app.route('/order-my-perfect-supplement').post(function (req, res) {
    var bodyParams = req.body

    if (bodyParams) {

        var formattedBodyParams = helpers.addLabel(bodyParams);
        var formattedPageParams = helpers.addLabel(_.omit(req.body, ['stripeToken','cardholdername']))
        var name = bodyParams.supplementName || "My Perfect Supplement"



        /*field validation */
        req.assert('name', 'a name is required').notEmpty();
        req.assert('street', 'a street is required').notEmpty();
        req.assert('state', 'a state is required').notEmpty();
        req.assert('zip', 'a zip is required').notEmpty();
        req.assert('email', 'a valid email required').isEmail();

        var errors = req.validationErrors();
        if (errors) {

            res.render('order-my-perfect-supplement', {details: formattedPageParams, name : name, errors: errors})
        }
        else {
            //todo add this to node.env flag
            //var stripe = require("stripe")("xxxxxxxxxxxxxxxxxx");
            var stripe = require("stripe")("sk_live_BNbs6oiKUMGb8jD94vAE73QN");

            // Get the credit card details submitted by the form
            var stripeToken = req.body.stripeToken;
            var charge = stripe.charges.create({
             amount: 1999, // amount in cents, again
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
                        formattedBodyParams.push({
                            label : "Charge ID",
                            value : charge.id
                        })
                    }

                     //Send the email
                     sendEmail(formattedBodyParams, false)

                     res.render('order-success', {details: formattedPageParams, name : _.escape(name)})

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
    var showKim = true
    if (params.design) {
        showKim = false;
        delete params.design;
    }
    var name = params.supplementName || "My Perfect Supplement"
    delete params.supplementName
    var formattedParams = helpers.addLabel(params);
    res.render('order-my-perfect-supplement', {details: formattedParams, name : _.escape(name), kim : showKim})

})



app.listen(app.get('port'), function(){
    console.log("MPS server listening on port " + app.get('port'));
});