var tts_api = (function(){

	var BASE_URL = "http://translate.google.com/translate_tts?tl=";

	function getUrl(lang, query){
		console.log("query:" + query);
		var encodedQuery = encodeURIComponent(query);
		console.log("encodedQuery:" + encodedQuery);
		var url = BASE_URL + lang + "&q=" + encodedQuery;
		return url;
	}

	function request(lang, query, callback){
		var url = getUrl(lang, query);
		console.log(url);
		$.ajax({
			url: url,
		}).done(function(response){
			console.log(response);
			callback(null, response);
		});
	}

	return {
		request: request
	}

})();