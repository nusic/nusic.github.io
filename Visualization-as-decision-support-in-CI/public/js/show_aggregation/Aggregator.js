 
var Aggregator = function(){

}

Aggregator.prototype.aggregationMethodMap = {
	code_change: 'default',
	patch_verification: 'passable',
	build: 'passable',
	code_review: 'passable',
	test_A: 'passable',
	test_B: 'passable',
	test_C: 'passable',
	test_D: 'passable',
	artifact: 'default',
	confidence_level: 'confidence_level',
	first_occurance: 'first_occurance',
}

Aggregator.prototype.unionOf = function(graphs, aggregationMethod){
	
	var unionNodeMap = {};

	for (var i = 0; i < graphs.length; i++) {
		var graphNodes = graphs[i].nodes();
		for (var j = 0; j < graphNodes.length; j++) {
			var nodeName = graphNodes[j];
			var nodeData = graphs[i].node(nodeName);
			nodeData.nodeIndex = j;

			// If aggregationMethod was provided as argument, use that,
			// else use aggregation method based on node type
			var nodeAggregationMethod = aggregationMethod || this.aggregationMethodMap[nodeData.type];
			try{
				this[nodeAggregationMethod](unionNodeMap, nodeData);
			}
			catch(e){
				console.log(nodeData.type)
			}
		};
	}

	var unionNodes = Object.keys(unionNodeMap).map(function (nodeType){
		return unionNodeMap[nodeType];
	});

	unionNodes = unionNodes.sort(function (n1, n2){
		return n1.maxNodeIndex - n2.maxNodeIndex;
	});

	//console.log( unionNodes.map( function (n){return n.type;} ) );

	var unionGraph = new dagreD3.graphlib.Graph()
		.setGraph({});

	unionNodes.forEach(function (unionNode){
		unionGraph.setNode(unionNode.type, unionNode);
	});

	//Keep track of how many graphs there were
	unionGraph.numAggregatedGraphs = graphs.length;

	for (var i = 0; i < graphs.length; i++) {
		var graphEdges = graphs[i].edges();
		for (var j = 0; j < graphEdges.length; j++) {
			var edge = graphEdges[j];
			var edgeData = graphs[i].edge(edge);

			var srcNodeData = graphs[i].node(edge.v);
			var dstNodeData = graphs[i].node(edge.w);

			var unionEdge = unionGraph.edge( { v: srcNodeData.type, w: dstNodeData.type } );
			if(unionEdge === undefined){
				unionGraph.setEdge(srcNodeData.type, dstNodeData.type, edgeData);
			}
		};
	};

	
	return unionGraph;
}

/*
 *
 * Aggregation methods
 *
 */

Aggregator.prototype.default = function(unionNodeMap, nodeData) {
	if(unionNodeMap[nodeData.type] === undefined){
		unionNodeMap[nodeData.type] = { 
			type: nodeData.type,
			count: 0,
			maxNodeIndex: 0,
		};
	}
	var unionNode = unionNodeMap[nodeData.type];
	unionNode.count++;
	unionNode.maxNodeIndex = Math.max(unionNode.maxNodeIndex, nodeData.nodeIndex);
};


Aggregator.prototype.passable = function(unionNodeMap, nodeData) {
	this.default(unionNodeMap, nodeData);
	
	var unionNode = unionNodeMap[nodeData.type];
	if(unionNode.passed === undefined) unionNode.passed = 0;
	if(unionNode.failed === undefined) unionNode.failed = 0;
	unionNode[nodeData.status]++;
}


Aggregator.prototype.confidence_level = function(unionNodeMap, nodeData) {
	this.default(unionNodeMap, nodeData);

	var unionNode = unionNodeMap[nodeData.type];
	if(unionNode.sumValue === undefined) unionNode.sumValue = 0;
	unionNode.sumValue += parseFloat(nodeData.value);
};


Aggregator.prototype.first_occurance = function(unionNodeMap, nodeData) {
	if(unionNodeMap[nodeData.type] === undefined){
		unionNodeMap[nodeData.type] = nodeData;
		unionNodeMap[nodeData.type].meta = 'first_occurance';
	}
};