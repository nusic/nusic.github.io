

var LocationPoller = function(wait){
	var lonEl = document.getElementById("lon");
	var latEl = document.getElementById("lat");
	var dataContainer = document.getElementById('data-container');

	function getLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition);
		} else {
			lonEl.innerHTML = "Not supported by this browser.";
			latEl.innerHTML = "Not supported by this browser.";
		}
	}

	function showPosition(position) {
		lonEl.innerHTML = position.coords.longitude; 
		latEl.innerHTML = position.coords.latitude; 
		dataContainer.innerHTML += position.coords.longitude + '&nbsp;&nbsp;&nbsp;' + position.coords.latitude + '<br />';
	};

	getLocation();
	var interval = setInterval(getLocation, wait);
}


