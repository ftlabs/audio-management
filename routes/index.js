const debug = require('debug')('audio-management:routes:index');
const express = require('express');
const router = express.Router();

const database = require('../bin/lib/database');
const generateS3URL = require('../bin/lib/generate-public-s3-url');

/* GET home page. */
router.get('/', (req, res, next) => {

	database.scan({
			TableName : process.env.AWS_AUDIO_METADATA_TABLE,
			FilterExpression : 'attribute_exists(#uuid)',
			ExpressionAttributeNames : {
				'#uuid': 'uuid'
			}
		
		})
		.then(data => {

			const readiedAssets = data.Items.map(item => {
				item.publicURL = generateS3URL(item.uuid);
				return item;
			});

			res.render('index', { 
				title: 'FT Labs Audio Management',
				audioAssets : Array.from(readiedAssets)
			});

		})
		.catch(err => {
			res.render('error', err);
		});
	;

});

module.exports = router;
