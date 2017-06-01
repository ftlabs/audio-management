const debug = require('debug')('bin:lib:search-topics');
const fetch = require('node-fetch');

module.exports = function(topic, offset = 0, recursive = false){
	const SAPI_URL_MINUS_KEY = `${process.env.CAPI_ENDPOINT}/search/v1`;
	const SAPI_URL = `${SAPI_URL_MINUS_KEY}?apiKey=${process.env.CAPI_KEY}`;
	
	const results = [];

	function search(topic, offset = 0){
		
		const SEARCH_BODY = {
			'queryString': `topics:${topic}`,
			'queryContext' : {
				'curations' : [ 'ARTICLES', 'BLOGS' ]
			},
			'resultContext' : {
				'maxResults' : '100',
				'offset' : offset,
				'aspects' : [ 'title', 'location', 'summary', 'lifecycle', 'metadata']
			}
		};
		
		return fetch(SAPI_URL, {
				'method'       : 'POST', 
				'body'         :  JSON.stringify(SEARCH_BODY),
				'headers'      : {
					'accept'       : 'application/json',
					'content-type' : 'application/json'
				}
			})
			.then(res => {
				if(res.status !== 200){
					throw `An error occurred retrieving ${SAPI_URL} with body=${JSON.stringify(SEARCH_BODY)},\nres=${JSON.stringify(res)}`;
				} else {
					return res.json();
				}
			})
			.then(data => {

				debug(data);
	
				if(data.results[0].indexCount < offset + 100){
					debug('Got em all. Number of results:', results.length);
					return results;
				} else {
					debug('Doing another search offset from:', offset + 100);
					data.results[0].results.forEach(result => {
						results.push(result);
					});
					return search(topic, offset + 100);
				}

			})
		;

	}

	return search(topic, offset)

}
