const debug = require('debug')('bin:lib:delete-files-and-metadata-for-items');

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

const database = require('./database');
const S3 = new AWS.S3();

function deleteItemFromS3Bucket(key){
	
	return new Promise( (resolve, reject) => {

		S3.deleteObject({ Bucket : process.env.AWS_AUDIO_BUCKET, Key : key }, (err, data) => {

			if(err){
				debug(err);
				reject(err);
			} else {
				debug(data);
				resolve(data);
			}

		});

	});

}

module.exports = function(uuid){

	const deleteItemsFromS3 = new Promise( (resolve, reject) => {
		
		S3.listObjects({ Bucket : process.env.AWS_AUDIO_BUCKET, Prefix : uuid }, function(err, data) {
			if (err) {
				reject(err);
			} else {
				console.log(data);

				const deleteActions = data.Contents.map(item => {
					return deleteItemFromS3Bucket(item.Key);
				});

				Promise.all(deleteActions)
					.then(function(){
						resolve();
					})
					.catch(err => {
						reject(err);
					})
				;

			}
		});

	});

	const deleteMetadata = database.read({uuid : uuid}, process.env.AWS_AUDIO_METADATA_TABLE)
		.then(data => {

			if(data.Item !== undefined){

				Object.keys(data.Item).forEach(key => {
					if(key !== 'uuid' && key !== 'enabled'){
						delete data.Item[key];
					}
				});

				debug(data.Item);

				return database.write(data.Item, process.env.AWS_AUDIO_METADATA_TABLE);

			} else {
				debug(`There is no metadata for item ${uuid} in the metadata table ${process.env.AWS_AUDIO_METADATA_TABLE}.`);
				return;
			}

		})
	;

	return Promise.all( [deleteItemsFromS3, deleteMetadata] )
		.then(results => {
			debug(results);
		})
		.catch(err => {
			debug(`ERRRRRRRRRRR`, err);
		})
	;

};