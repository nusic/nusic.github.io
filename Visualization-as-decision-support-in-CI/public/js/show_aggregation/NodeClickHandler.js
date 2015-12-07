

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
	$('#timeline1').empty();
	var nodeDataArray = this.getDataFor(nodeName);
	var method = this.map[nodeName];
	this[method](nodeDataArray);

	//this.element.textContent = JSON.stringify(nodeDataArray);
};

NodeClickHandler.prototype.code_change = function(nodeDataArray) {
	console.log('handler: code_change');
};

NodeClickHandler.prototype.code_review = function(nodeDataArray) {
	this.passable(nodeDataArray);
	console.log('handler: code_review');
};

NodeClickHandler.prototype.passable = function(nodeDataArray) {
	console.log('handler: passable');
	var firstTime = nodeDataArray[0].time;
	var lastTime = nodeDataArray[nodeDataArray.length -1].time;

	var timelineData = [
		{class: 'passed', times: []},
		{class: 'failed', times: []}
	];

	for (var i = 0; i < nodeDataArray.length; i++) {
		var classIndex = nodeDataArray[i].status === 'passed' ? 0 : 1
		timelineData[classIndex].times.push({
			starting_time: parseInt(nodeDataArray[i].time),
			ending_time: (parseInt(nodeDataArray[i].time) + 10*60*1000),
		});
	};


	var chart = d3.timeline()
          .tickFormat( //
            {format: d3.time.format("%Y-%m-%d"),
            tickTime: d3.time.days,
            tickInterval: nodeDataArray.length,
            tickSize: 5})
          .display("circle"); // toggle between rectangles and circles
   
    var svg = d3.select("#timeline1").append("svg").attr("width", 1000)
          .datum(timelineData).call(chart);

    d3.selectAll('circle.timelineSeries_passed')[0].forEach(function(e){
    	e.style.fill = 'rgba(0, 255, 0, 0.3)';
    });

    d3.selectAll('circle.timelineSeries_failed')[0].forEach(function(e){
    	e.style.fill = 'rgba(255, 0, 0, 0.3)';
    });
};

NodeClickHandler.prototype.artifact = function(nodeDataArray) {
	console.log('handler: artifact');
};

NodeClickHandler.prototype.confidence_level = function(nodeDataArray) {
	console.log('handler: confidence_level');
};

