/**
 * Created by ryanford on 12/27/14.
 */
module.exports = {

    firstLetterUppercase : function (str) {
        if (str) {
           return str.charAt(0).toUpperCase() + str.slice(1)
        }
        else
        return str
    }




}