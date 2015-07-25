module.exports = function (ProviderWaitList) {

    ProviderWaitList.observe('after save', function (ctx, next) {

        ProviderWaitList.getApp(function (err, app) {

            var Email = app.models.Email,
                body,
                htmlBody;

            if (app.get('emailsOn')) {
                body = htmlBody = 'CALL NOW: ' + ctx.instance.phoneNumber + ' ' +  ctx.instance.name;
                Email.send({
                        to: ['16nate16@gmail.com', 'fadichalfoun@gmail.com'],
                        from: "healthforge.outbound@gmail.com",
                        subject: 'BOOM!!!!!!',
                        text: body,
                        html: htmlBody
                    });
            }
        });

        next();
    });
};
