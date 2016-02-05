

var Decorator = function(){

}

Decorator.prototype.decorate = function(g){

	var thisDecorator = this;

	g.nodes().forEach(function (nodeId){
		var node = g.node(nodeId);
		node.id = node.id || nodeId;
		thisDecorator.decorateNode(node);
	});

	g.edges().forEach(function (edgeId){
		var edge = g.edge(edgeId);
		var srcNode = g.node(edgeId.v);
		var dstNode = g.node(edgeId.w);
		thisDecorator.decorateEdge(edge, srcNode, dstNode);
	});

	g.graph().rankdir = "RL";
	g.graph().ranksep = 30;
	g.graph().nodesep = 15;
}

Decorator.prototype.getFormattedType = function(node) {
	var typeStr = node.type.replace(/_/g,' '); //Replace '_' with ' '
	typeStr = typeStr.charAt(0).toUpperCase() + typeStr.slice(1); //Capitalize first letter
	return typeStr;
};

Decorator.prototype.addTypeToLabel = function(node) {
	node.label += this.getFormattedType(node);;
}

Decorator.prototype.addTimeToLabel = function(node) {
	var d = new Date(Number(node.time));
	node.label += '\n' + d.toDateAndTimeStr();
};

Decorator.prototype.addDateToLabel = function(node) {
	var d = new Date(Number(node.time));
	node.label += '\n' + d.toDateStr();
};

Decorator.prototype.colorCodePassFail = function(node) {
	if(node.status === 'passed') node.style += 'fill: #afa;';
	if(node.status === 'failed') node.style += 'fill: #faa;';
};




Decorator.prototype.decorateNode = function(node) {
	node.label = '';
	node.style = '';

	// applies to node types: patch_verification, code_review, build and test
	this.addTypeToLabel(node);
	node.formattedType = this.getFormattedType(node);
	this.addTimeToLabel(node);
	this.colorCodePassFail(node);

	this[node.type](node);
};

Decorator.prototype.decorateEdge = function(edge, srcNode, dstNode) {
	//console.log(srcNode.type + ' ' + srcNode.graphIndex + ' -> ' + dstNode.type + ' ' + dstNode.graphIndex);

	edge.label = edge.type;
	edge.class = ' ';
	edge.labelStyle = ' ';

	if(srcNode.graphIndex !== dstNode.graphIndex){
		edge.labelStyle = 'font-style: italic;'

		if(srcNode.graphIndex < dstNode.graphIndex){
			edge.label = '          ';
			edge.class = 'edge-invisible';
		}
		else{
			edge.label = 'indirect';
			edge.class = 'indirect';
		}
	}
};




Decorator.prototype.code_change = function(node){
	node.shape = 'circle';
	node.label += '\n#' + node.id;
	node.label += '\n(' + node.contributor + ')';
}

Decorator.prototype.code_review = function(node){
	node.label += '\n(' + node.reviewer +')';
}

Decorator.prototype.patch_verification = function(node){

}

Decorator.prototype.build = function(node){

}

Decorator.prototype.test_A = function(node){
	this.test(node);
}

Decorator.prototype.test_B = function(node){
	this.test(node);
}

Decorator.prototype.test_C = function(node){
	this.test(node);
}

Decorator.prototype.test_D = function(node){
	this.test(node);
}

Decorator.prototype.test = function(node){

}

Decorator.prototype.artifact = function(node){
	node.shape = 'circle';
	node.style += 'fill: #aaf;'; 
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

