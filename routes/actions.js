const debug = require('debug')('audio-management:routes:action');
const express = require('express');
const router = express.Router();

const database = require('../bin/lib/database');
const purgeCacheItem = require('../bin/lib/purge-availability-cache-of-item');
const obliviate = require('../bin/lib/delete-files-and-metadata-for-item');

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

					purgeCacheItem(req.params.UUID)
						.catch(err => {
							debug(err);
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

router.get(`/delete/:UUID(${uuidRegex})`, (req, res) => {

	obliviate(req.params.UUID)
		.then(function(){

			purgeCacheItem(req.params.UUID)
				.catch(err => {
					debug(err);
				})
			;

			res.json({
				status : 'ok',
				message : `Audio files and associated metadata for ${req.params.UUID} have been deleted`
			});

		})
	;


});

module.exports = router;
