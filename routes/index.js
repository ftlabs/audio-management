const debug = require('debug')('audio-management:routes:index');
const fs = require('fs');
const express = require('express');
const hbs = require('hbs');
const router = express.Router();

const database = require('../bin/lib/database');
const generateS3URL = require('../bin/lib/generate-public-s3-url');
const dateStampToUnix = require('../bin/lib/convert-datestamp-to-unix');
const searchTopics = require('../bin/lib/search-topics');

const tableSource = fs.readFileSync(`${__dirname}/../views/partials/table.hbs`, 'utf8');
const rogueSource = fs.readFileSync(`${__dirname}/../views/partials/rogue.hbs`, 'utf8');

function getArticlesData(ExclusiveStartKey){

	const scanParameters = {
		TableName : process.env.AWS_AUDIO_METADATA_TABLE,
		ExpressionAttributeNames : {
			'#uuid': 'uuid',
			'#H': 'is-human'
		},
		ExpressionAttributeValues : {
			':human': 'true'
		},
		FilterExpression : 'attribute_exists(#uuid) and #H = :human',
		ExclusiveStartKey : ExclusiveStartKey
	};

	const dataPromises = [database.scan(scanParameters), searchTopics('audio-articles')];

	return Promise.all(dataPromises)
		.then(results => {

			results[1] = results[1].results[0].results;

			const readiedAssets = results[0].Items.filter(item => {
					// Items that have been deleted from the database still have their UUID
					// and enabled values saved, so that if they're reabsorbed, a previously
					// disabled item will not become re-enabled by default;
					// The keys are uuid, and enabled 
					if(Object.keys(item).length > 2){
						return true;
					} else {
						return false;
					}
				})
				.map(item => {
					item.publicURL = generateS3URL(item.uuid);

					item.tagged = results[1].some(tagged => {
						return tagged.id === item.uuid;
					});
					item.__unix_datestamp = dateStampToUnix( item.pubdate );

					return item;
				})
				.sort( (a, b) => {

					if(a.__unix_datestamp > b.__unix_datestamp){
						return -1
					} else if(a.__unix_datestamp < b.__unix_datestamp){
						return 1;
					}

				})
			;

			const rogueAssets = [];

			return {
				audioAssets : readiedAssets,
				rogueAssets,
				offsetKey : results[0].offsetKey
			};

		})
	;

}

/* GET home page. */
router.get('/', (req, res) => {

	debug('Scanning database');
	console.time('scan')

	res.render('index', { 
		title: 'FT Labs Audio Management'
	});

});

router.get('/table', (req, res) => {

	const offsetKey = req.query.offsetKey === 'undefined' ? undefined : req.query.offsetKey;

	getArticlesData(offsetKey)
		.then(data => {
			debug(data);
			
			const tableTemplate = hbs.compile(tableSource);
			const rogueTemplate = hbs.compile(rogueSource);

			res.json({
				offsetKey : data.offsetKey,
				tableHTML : tableTemplate({ 
					audioAssets : Array.from(data.audioAssets),
					layout : false
				}),
				rogueHTML : rogueTemplate({
					rogueAssets : Array.from(data.rogueAssets),
					layout : false
				})
			});
		})
		.catch(err => {
			debug('/table err', err);
			res.status = err.status || 500;
			res.json({
				status : 'err',
				message : 'An error occurred retrieving the table data'
			});
		})
	;

});

module.exports = router;
