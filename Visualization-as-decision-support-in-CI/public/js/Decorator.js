

var Decorator = function(){

}

Decorator.prototype.decorate = function(g){
	var thisDecorator = this;
	g.nodes().forEach(function (id){
    	var node = g.node(id);
		thisDecorator.decorateNode(node);
	});
}

Decorator.prototype.decorateNode = function(node) {

	// Set label to node type, and prettify some
	node.label = node.type.replace(/_/g,' ');
	node.label = node.label.charAt(0).toUpperCase() + node.label.slice(1);

	// applies to node types: patch_verification, code_review, build and test
	if(node.passed === 'true') node.style = 'fill: #afa;';
	if(node.passed === 'false') node.style = 'fill: #faa;';

	if(['code_change','artifact','confidence_level'].indexOf(node.type) !== -1){
		node.shape = 'ellipse';
	}

	this[node.type](node);
};

Decorator.prototype.code_change = function(node){
	node.label += '\n(' + node.contributor + ')'
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

}

Decorator.prototype.confidence_level = function(node){
	var c = Number(node.value);
	node.label = 'confidence: ' + c.toFixed(2);

	var min = 170
	var max = 255;
	var r = Math.round( min + (max-min)*(1-c) );
	var g = Math.round( min + (max-min)*c );
	var b = min;

	node.style = 'fill: rgb('+ r + ',' + g + ',' + b + ');';
	
}

