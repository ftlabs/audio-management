const debug = require('debug')('bin:lib:search-topics');
const fetch = require('node-fetch');

module.exports = function(topic){
	const SAPI_URL_MINUS_KEY = `${process.env.CAPI_ENDPOINT}/search/v1`;
	const SAPI_URL = `${SAPI_URL_MINUS_KEY}?apiKey=${process.env.CAPI_KEY}`;

	const SEARCH_BODY = {
		'queryString': `topics:${topic}`,
  		'queryContext' : {
  			'curations' : [ 'ARTICLES', 'BLOGS' ]
  		},
  		'resultContext' : {
  			'maxResults' : '100',
  			'offset' : '0',
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
	;
}
