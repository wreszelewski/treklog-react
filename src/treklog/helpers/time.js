const moment = require('moment');

function twoZeroes(value) {
    if(value < 10) {
        return '0' + value.toString();
    } else {
        return value.toString();
    }
}

function formatSeconds(seconds) {
    if(seconds) {
        const duration = moment.duration(seconds, 'seconds');
        const secs = duration.seconds();
        const mins = duration.minutes();
        const hours = duration.asHours().toString().split('.')[0];
        return hours + ':' + twoZeroes(mins) + ':' + twoZeroes(secs) + 'h';
    }
}

module.exports = {
    formatSeconds
}