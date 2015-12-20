var TimeLineHandler = function () {

}

TimeLineHandler.prototype.setGraphs = function(graphs) {
	this.graphs = graphs;
};

TimeLineHandler.prototype.map = {
	'code_change': 'none',
	'patch_verification': 'passable',
	'code_review': 'passable',
	'build': 'passable',
	'test_A': 'passable',
	'test_B': 'passable',
	'test_C': 'passable',
	'test_D': 'passable',
	'artifact': 'none',
	'confidence_level': 'scalar'
}

TimeLineHandler.prototype.getGraphWith = function() {
	return window.innerWidth - 30;
};

TimeLineHandler.prototype.getDataFor = function(type) {
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

TimeLineHandler.prototype.handlerFunction = function(nodeName) {
	$('#timeline1').empty();
	var nodeDataArray = this.getDataFor(nodeName);
	var method = this.map[nodeName];
	this[method](nodeDataArray);
};

TimeLineHandler.prototype.passable = function(nodeDataArray) {

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
            tickTime: d3.time.hours,
            tickInterval: nodeDataArray.length,
            tickSize: 2})
          .display("circle"); // toggle between rectangles and circles

    var svg = d3.select("#timeline1").append("svg").attr("width", this.getGraphWith())
          .datum(timelineData).call(chart);

    d3.selectAll('circle.timelineSeries_passed')[0].forEach(function(e){
    	e.style.fill = 'rgba(0, 255, 0, 0.2)';
    });

    d3.selectAll('circle.timelineSeries_failed')[0].forEach(function(e){
    	e.style.fill = 'rgba(255, 0, 0, 0.2)';
    });
};

TimeLineHandler.prototype.scalar = function(nodeDataArray) {

	nodeDataArray.forEach(function (node){
		node.time = +node.time;
		node.value = +node.value;
	});

	// Set the dimensions of the canvas / graph
	var margin = {top: 20, right: 20, bottom: 20, left: 50},
	    width = this.getGraphWith() - margin.left - margin.right,
	    height = 100 - margin.top - margin.bottom;

	// Parse the date / time
	var parseDate = d3.time.format("%Y-%m-%d").parse;

	// Set the ranges
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(2);

	// Define the line
	var valueline = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.value); });
	    
	// Adds the svg canvas
	var svg = d3.select('#timeline1')
	    .append("svg")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	        .attr("transform", 
	              "translate(" + margin.left + "," + margin.top + ")");

	// Get the data
	var data = nodeDataArray.map(function (node){
		return { 
			date: new Date(node.time),
			value: node.value,
		};
	});

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, Math.max(1, d3.max(data, function(d) { return d.value; }))]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

	
};

TimeLineHandler.prototype.none = function(nodeDataArray) {

};
