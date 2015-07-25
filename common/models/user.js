var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var crypto = require('crypto');

module.exports = function (User) {

    User.observe('before save', function (ctx, next) {
        var user = ctx.instance;
        if(user) {
            if(!user.emailVerified && user.sourceType === 'publicRegistrationPage') {
                crypto.randomBytes(64, function (err, buf) {
                    if (err) {
                        console.log(err);
                    } else {
                        user.password = buf.toString('hex');
                        next();
                    }
                });
            } else {
                next();
            }
        } else {
            next();
        }
    });

    User.observe('after save', function (ctx, next) {
        var user = ctx.instance;

        //if there is a source for this user (such as a recommendation ID, we need to attach the incoming profile to the recommendation)
        if (user.source) {
            User.getApp(function (err, app) {
                var RecommendationAlpha = app.models.RecommendationAlpha;
                RecommendationAlpha.findOne({where: {id: ctx.instance.source}, limit: 1}, function (err, rec) {
                    rec.clientProfile = user.profile;
                    rec.save(function () { console.log('recommendation updated!'); });
                    console.log('wizard data attached to recommendation:');
                    console.log(user.profile);
                });
            });
        }

        if (false && !user.emailVerified && !user.verificationToken) {
            console.log("sending verification email to user: " + user.email);
            User.getApp(function (err, app) {

                function getAbsolutePath() {
                    var protocol = app.get('https') ? "https" : "http";
                    return protocol + "://" + app.get('host') + ":" + app.get('port') + "/#/";
                }

                crypto.randomBytes(8, function (err, buf) {
                    if (err) {
                        fn(err);
                    } else {
                        user.verificationToken = buf.toString('hex');
                        user.save(function (err) {
                            if (err) {
                                fn(err);
                            } else {
                                var Email = app.models.Email,
                                    verifyHref = getAbsolutePath() + 'verify/' + user.verificationToken + '/' + user.id,
                                    body = 'Please verify your email by opening this link in a web browser:\n\t{href}',
                                    template = ejs.compile(fs.readFileSync(path.join(__dirname, '..', '..', 'templates', 'verify.ejs'), 'utf8'));
                                body = body.replace('{href}', verifyHref);
                                if (app.get('emailsOn')) {
                                    Email.send({
                                            to: user.email,
                                            from: "healthforge.outbound@gmail.com",
                                            subject: 'Account Access Instructions',
                                            text: body,
                                            html: template({'verifyHref': verifyHref})
                                        },
                                        function (err) {
                                            if (err) {
                                                console.log('ERROR sending verification email to: ' + user.email);
                                                console.log(err);
                                            } else {
                                                console.log('Verification email sent to: ' + user.email);
                                            }
                                            next();
                                        }
                                    );
                                } else {
                                    console.info('emails turned off... skipping verification email to: ' + user.email);
                                    next();
                                }
                            }
                        });
                    }
                });
            });
        } else {
            next();
        }
    });
};