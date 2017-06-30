const debug = require('debug')('bin:lib:register-partials');
const fs = require('fs');
const hbs = require('hbs');
const partialsPath = `${__dirname}/../../views/partials`;

module.exports = function(){

	fs.readdirSync(partialsPath).forEach(partial => {
		const name = partial.replace('.hbs', '');
		hbs.registerPartial(name, require(`${partialsPath}/${name}.hbs`));
		debug(`Partial '${name}' registered`);
	});

}