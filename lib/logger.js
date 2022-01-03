var colors = require('colors')
function date() {
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    var hours = date_ob.getHours();
    var minutes = date_ob.getMinutes();
    var seconds = date_ob.getSeconds();
    if (minutes == 0) minutes = "00"
    if (seconds == 0) seconds = "00"
    if (hours == 0) hours = "00"
    var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return " [" + dateTime + "] "
}
var c = (function (oldCons) {
    return {
        log: function (...text) {
            oldCons.log(...text);
        },
        info: function (text, object) {
            if (object instanceof Object) {
                var keys = Object.keys(object)
                var s = ""
                keys.forEach(k => {
                    s += k.blue + "=" + object[k] + " "
                })
                oldCons.info('INFO'.blue + ":" + date() + text + " " + s);
            } else {
                oldCons.info('INFO'.blue + ":" + date() + text);
            }

        },
        warn: function (text) {
            oldCons.warn(text);
        },
        error: function (text, object) {
            if (object instanceof Object) {
                var keys = Object.keys(object)
                var s = ""
                keys.forEach(k => {
                    s += k.red + "=" + object[k] + " "
                })
                oldCons.error('ERR'.red + ":" + date() + text + " " + s);
            } else {
                oldCons.error('ERR'.red + ":" + date() + text);
            }

        }
    };
})(console);

console = c;