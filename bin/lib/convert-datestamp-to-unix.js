const debug = require('debug')('bin:lib:convert-datestamp-to-unix');
const moment = require('moment');

module.exports = function(dateStamp, stampFormat='ddd, DD MMM YYYY HH:mm:ss ZZ'){
	
	debug(`Converting dateStamp (${dateStamp}) to unix time`);
	const unixValue = moment(dateStamp, stampFormat).valueOf();
	debug(`${dateStamp} -> ${unixValue}`);
	return unixValue;
	
};	