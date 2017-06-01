const debug = require('debug')('audio-management:routes:index');
const express = require('express');
const router = express.Router();

const database = require('../bin/lib/database');
const generateS3URL = require('../bin/lib/generate-public-s3-url');
const dateStampToUnix = require('../bin/lib/convert-datestamp-to-unix');
const searchTopics = require('../bin/lib/search-topics');

/* GET home page. */
router.get('/', (req, res) => {

	database.scan({
			TableName : process.env.AWS_AUDIO_METADATA_TABLE,
			FilterExpression : 'attribute_exists(#uuid)',
			ExpressionAttributeNames : {
				'#uuid': 'uuid'
			}
		
		})
		.then(data => {

			searchTopics('audio-articles')
				.then(taggedArticles => {

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

					res.render('index', { 
						title: 'FT Labs Audio Management',
						audioAssets : Array.from(readiedAssets),
						rogueAssets : Array.from(rogueAssets)
					});

				})
			;


		})
		.catch(err => {
			res.render('error', err);
		});
	;

});

module.exports = router;
