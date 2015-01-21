/**
 * Created by ryanford on 12/27/14.
 */
_ = require('underscore')
module.exports = {

    firstLetterUppercase : function (str) {
        if (str) {
           return str.charAt(0).toUpperCase() + str.slice(1)
        }
        else
        return str
    },
    addLabel : function (params) {
        var formattedItems = [];
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                var val = params[prop] ? params[prop] : "N/A"
                formattedItems.push({
                    label : this.firstLetterUppercase(prop),
                    value : _.escape(val)
                })
            }
        }
        return formattedItems;

    }

}