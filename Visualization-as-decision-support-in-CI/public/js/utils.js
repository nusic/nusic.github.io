function _pad(n, size){
	return ('00000' + n).slice(-size);
}

Date.prototype.toDateStr = function() {
	return this.getFullYear() 
		+ '-' + _pad((this.getMonth()+1), 2)
		+ '-' + _pad(this.getDate(), 2);
};

Date.prototype.toTimeStr = function() {
	return _pad(this.getHours(), 2)
		+ ':' + _pad(this.getMinutes(), 2)
		+ ':' + _pad(this.getSeconds(), 2);
};

Date.prototype.toDateAndTimeStr = function() {
	return this.toDateStr() + ' ' + this.toTimeStr();
};


