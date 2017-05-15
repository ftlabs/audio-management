const debug = require('debug')('bin:lib:log')

module.exports = (req, res, next) => {
	debug(`Who: ${res.locals.s3o_username}, Path: ${req.path}, Data: ${JSON.stringify(req.body)},`);
	next();
};