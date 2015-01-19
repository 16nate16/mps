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
    path            = require('path'),
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

app.route('/customized-supplement').get(function (req, res) {
    res.render('customized-supplement')
})
app.route('/about').get(function (req, res) {
    res.render('about')
})

app.route('/contact').get(function (req, res) {
    var emailParams = req.query
    console.log(emailParams)
    var formattedParams = helpers.addLabel(emailParams)
    console.log("$$$$$$$$$$$$$$$$$")
    console.log(formattedParams)
    console.log("$$$$$$$$$$$$$$$$$")
    //add charge info here
    sendEmail(formattedParams, true)
    res.render('contact')
})

function validateFields(fields) {
    return fields
}

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
            to:      "ryno412@gmail.com, natewhitaker16@gmail.com ",
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
                console.log(message);
            }

        });

    }
    else {
        server.send({
            text:    "MPS Purchase",
            from:    "orders@myperfectsupplement.com",
            to:      "orders@myperfectsupplement.com, ryno412@gmail.com",
            subject: "BOOM! MPS hittin dog...",
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
                console.log(message);
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
    console.log(req.body)
    if (req.body && !validateFields(req.body).errors) {
       // var stripe = require("stripe")("sk_test_lMcyGuyEPmL3MoAiIXZAEgbm");
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
                var emailParams = req.body
                if (charge && charge.id) {
                    emailParams.chargeId = charge.id
                }
                var formattedParamas = helpers.addLabel(emailParams)
                //add charge info here
                sendEmail(formattedParamas)

                console.log(req.query)
                var params = req.query
                var name = params.supplementName || "My Perfect Supplement"
                delete params.supplementName
                var formattedParams = helpers.addLabel(params);
                res.render('order-success', {details: formattedParams, name : name})

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