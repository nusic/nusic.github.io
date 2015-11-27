

var Decorator = function(){

}

Decorator.prototype.decorate = function(g){
	var thisDecorator = this;
	g.nodes().forEach(function (id){
    	var node = g.node(id);
		thisDecorator.decorateNode(node);
	});
}

Decorator.prototype.addTypeToLabel = function(node) {
	var typeStr = node.type.replace(/_/g,' '); //Replace '_' with ' '
	typeStr = typeStr.charAt(0).toUpperCase() + typeStr.slice(1); //Capitalize first letter
	node.label += typeStr;
}

Decorator.prototype.addTimeToLabel = function(node) {
	var d = new Date(Number(node.time));
	var timeStr = d.toString().slice(16, 25);
	node.label += '\n' + timeStr;
};

Decorator.prototype.addDateToLabel = function(node) {
	var d = new Date(Number(node.time));
	var dateStr = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
	node.label += '\n' + dateStr;
};

Decorator.prototype.colorCodePassFail = function(node) {
	if(node.passed === 'true') node.style += 'fill: #afa;';
	if(node.passed === 'false') node.style += 'fill: #faa;';
};

Decorator.prototype.decorateNode = function(node) {
	node.label = '';
	node.style = '';

	// applies to node types: patch_verification, code_review, build and test
	this.addTypeToLabel(node);
	this.addTimeToLabel(node);
	this.colorCodePassFail(node);

	this[node.type](node);
};




Decorator.prototype.code_change = function(node){
	node.shape = 'circle';
	this.addDateToLabel(node);
	node.label += '\n(' + node.contributor + ')';
}

Decorator.prototype.code_review = function(node){
	node.label += '\n(' + node.reviewer +')';
}

Decorator.prototype.patch_verification = function(node){

}

Decorator.prototype.build = function(node){

}

Decorator.prototype.test = function(node){

}

Decorator.prototype.artifact = function(node){
	node.shape = 'circle';
}

Decorator.prototype.confidence_level = function(node){
	node.shape = 'circle';

	var c = Number(node.value);
	node.label += '\nvalue: ' + c.toFixed(2);

	var min = 170
	var max = 255;
	var r = Math.round( min + (max-min)*(1-c) );
	var g = Math.round( min + (max-min)*c );
	var b = min;

	node.style = 'fill: rgb('+ r + ',' + g + ',' + b + ');';
	
}

