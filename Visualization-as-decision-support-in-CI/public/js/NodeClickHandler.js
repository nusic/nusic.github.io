

var NodeClickHandler = function (element) {
	this.element = element;
}

NodeClickHandler.prototype.setGraphs = function(graphs) {
	this.graphs = graphs;
};

NodeClickHandler.prototype.map = {
	'code_change': 'code_change',
	'patch_verification': 'passable',
	'code_review': 'code_review',
	'build': 'passable',
	'test_A': 'passable',
	'test_B': 'passable',
	'test_C': 'passable',
	'test_D': 'passable',
	'artifact': 'artifact',
	'confidence_level': 'confidence_level'
}

NodeClickHandler.prototype.getDataFor = function(type) {
	var nodeDataArray = [];

	var indexOfLastFound = undefined;
	var dataFound = 0;
	var dataFoundQuickly = 0;
	var dataNotFound = 0;

	graphLoop:
	for (var i = 0; i < this.graphs.length; i++) {
		var graph = this.graphs[i]
		var nodes = graph.nodes();

		// Try find the node at where we last found a node for speedup
		if(indexOfLastFound !== undefined){
			var nodeData = graph.node(nodes[indexOfLastFound]);
			if(nodeData && nodeData.type === type){
				dataFoundQuickly++;		
				nodeDataArray.push(nodeData);
				continue graphLoop;
			}
		}

		for (var j = 0; j < nodes.length; j++) {
			var nodeData = graph.node(nodes[j]);
			if(nodeData.type === type){
				dataFound++;
				indexOfLastFound = j;
				nodeDataArray.push(nodeData);
				continue graphLoop;
			}
		};
		dataNotFound++;
	};

	//console.log('dataFound:' + dataFound);
	//console.log('dataFoundQuickly:' + dataFoundQuickly);
	//console.log('dataNotFound:' + dataNotFound);	

	return nodeDataArray;
};

NodeClickHandler.prototype.handlerFunction = function(nodeName) {
	var nodeDataArray = this.getDataFor(nodeName);
	var method = this.map[nodeName];
	this[method](nodeDataArray);

	this.element.textContent = JSON.stringify(nodeDataArray);
};

NodeClickHandler.prototype.code_change = function(nodeDataArray) {
	console.log('handler: code_change');
};

NodeClickHandler.prototype.code_review = function(nodeDataArray) {
	console.log('handler: code_review');
};

NodeClickHandler.prototype.passable = function(nodeDataArray) {
	console.log('handler: passable');
};

NodeClickHandler.prototype.artifact = function(nodeDataArray) {
	console.log('handler: artifact');
};

NodeClickHandler.prototype.confidence_level = function(nodeDataArray) {
	console.log('handler: confidence_level');
};