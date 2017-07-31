const debug = require('debug')('bin:lib:delete-files-and-metadata-for-items');
const fetch = require('node-fetch');

const audioPurgerUri = uuid => `${process.env.AUDIO_PURGER_URI}${uuid}`;

module.exports = uuid => {
  return fetch(audioPurgerUri(uuid), {
    method: 'DELETE',
    headers: { 'token': process.env.AUDIO_PURGER_TOKEN }
  })
    .then(response => {
  		if (response.ok) {
  			return response.json();
  		} else {
  			return response.text()
  				.then(text => {
  					throw new Error(`audio-purger responded with "${text}" (${response.status})`);
  				});
  		}
    });

};
