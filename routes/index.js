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

function getArticlesData(ExclusiveStartKey){

	const scanParameters = {
		TableName : process.env.AWS_AUDIO_METADATA_TABLE,
		FilterExpression : 'attribute_exists(#uuid)',
		ExpressionAttributeNames : {
			'#uuid': 'uuid'
		},
		ExclusiveStartKey : ExclusiveStartKey
	};

	return database.scan(scanParameters)
	.then(data => {

		debug('Database scan complete');

		return searchTopics('audio-articles')
			.then(taggedArticles => {

				taggedArticles = taggedArticles.results[0].results;

				const readiedAssets = data.Items.filter(item => {
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

						item.tagged = taggedArticles.some(tagged => {
							return tagged.id === item.uuid;
						});

						return item;
					})
					.sort( (a, b) => {

						const aTime = dateStampToUnix( a.pubdate );
						const bTime = dateStampToUnix( b.pubdate );

						if(aTime > bTime){
							return -1
						} else if(aTime < bTime){
							return 1;
						}

					})
				;

				const rogueAssets = taggedArticles.map(taggedArticle => {
						return readiedAssets.some( asset => { return asset.uuid === taggedArticle.id } ) ? null : taggedArticle
					})
					.filter(a => {return a !== null})
				;

				return {
					audioAssets : readiedAssets,
					rogueAssets,
					offsetKey : data.offsetKey
				};

			})
		;

	});

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
			var template = hbs.compile(tableSource);
			var result = template({ 
				audioAssets : Array.from(data.audioAssets),
				layout : false
			});

			res.json({
				offsetKey : data.offsetKey,
				tableHTML : result
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

router.get('/rogueassets', (req, res) => {
	
	getArticlesData()
		.then(data => {
			res.render('partials/rogue', { 
				rogueAssets : Array.from(data.rogueAssets),
				layout : false
			});
		})
		.catch(err => {
			debug('/rogueassets err', err);
			res.status = err.status || 500;
			res.json({
				status : 'err',
				message : 'An error occurred retrieving the table data'
			});
		})
	;

});

module.exports = router;
