
/*
 * Power up the Date prototype with some toString functions
 */

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

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
} 


/*
 * Power up the array prototype
 */
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}




/*
 * Helper function for Graphs
 */
var Graph = graphlibDot.graphlib.Graph;

Graph.prototype.getDeveloper = function() {
	var codeChangeId = this.nodes()[0];
	var codeChangeData = this.node(codeChangeId);
	return codeChangeData.contributor;
};

Graph.prototype.getCodeChange = function() {
	var codeChangeId = this.nodes()[0];
	var codeChangeData = this.node(codeChangeId);
	return codeChangeData;
};

Graph.prototype.getFirstWith = function(property, value) {
	var nodes = this.nodes()
	for (var i = 0; i < nodes.length; i++) {
		var nodeData = this.node(nodes[i]);
		if(value !== undefined){
			if(nodeData[property] === value){
				return nodes[i];
			}
		}
		else if(nodeData[property]){
			return nodes[i];
		}
	};
	return null;
};