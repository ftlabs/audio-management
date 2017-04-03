const debug = require('debug')('audio-management:routes:action');
const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();

const database = require('../bin/lib/database');

const uuidRegex = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';
router.get(`^(/enable|/disable)/:UUID(${uuidRegex})$`, (req, res) => {

	debug(req.params.UUID);

	const enable = req.path.indexOf('enable') > -1;

	database.read({
			uuid : req.params.UUID
		}, process.env.AWS_AUDIO_METADATA_TABLE)
		.then(data => {

			if(data.Item === undefined){

				throw {
					statusCode : 404,
					status : 'err',
					message : `An item with the UUID '${req.params.UUID}' does not exist in the metadata table`
				};

			} else {

				const item = data.Item;
				item.enabled = enable;

				return item;

			}

		})
		.then(adjustedItem => {
			
			return database.write(adjustedItem, process.env.AWS_AUDIO_METADATA_TABLE)
				.then(function(thing){
					debug(thing)
					res.json({
						status : 'ok',
						message : `The availability for item ${req.params.UUID} has been toggled. It is now enabled: ${enable}`
					})

					fetch(`${process.env.FT_AVAILABILITY_SERVICE_URL}/purge/${req.params.UUID}?purgeToken=${process.env.FT_AVAILABILITY_SERVICE_CACHE_PURGE_KEY}`)
						.then(res => {
							if(res.ok){
								return res.json();
							} else {
								throw res;
							}
						})
						.catch(err => {
							debug(`An error occurred purging the cache for ${req.params.UUID} at ${process.env.FT_AVAILABILITY_SERVICE_URL}`, err);
						})
					;

				})
			;

		})
		.catch(err => {
			debug(err);
			res.status(err.statusCode || 500);
			res.json(err);
		})
	;

});

module.exports = router;
