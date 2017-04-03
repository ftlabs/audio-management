const debug = require('debug')('bin:lib:convert-datestamp-to-unix');
const moment = require('moment');

module.exports = function(dateStamp, stampFormat='ddd, DD MMM YYYY HH:mm:ss ZZ'){

	return moment(dateStamp, stampFormat).valueOf();

};	