function ShowDeltaClickHandler(element){
	this.element = element;
	this.graphs;
	this.graph;
	
	this.$messageElement = $('<div class="edge-message"></div>');
	$(element).before( this.$messageElement );
}

ShowDeltaClickHandler.prototype.setGraphs = function(graphs) {
	this.graphs = graphs;
};

ShowDeltaClickHandler.prototype.setGraph = function(graph) {
	this.graph = graph;
	var firstNodeId = graph.nodes()[0];
	this.firstNodeGraphIndex = graph.node(firstNodeId).graphIndex;
};

ShowDeltaClickHandler.prototype.onEdgeClick = function(edge) {
	this.onNodeClick(edge.v);
};

ShowDeltaClickHandler.prototype.onNodeClick = function(node) {
	var nodeData = this.graph.node(node);
	var deltaGraphs = this.graphs.slice(this.firstNodeGraphIndex+1, nodeData.graphIndex+1);

	if(deltaGraphs.length){
		var header = '<h4>Additional code changes included in ' + nodeData.formattedType + ':</h4>';
		var deltaHtml = deltaGraphs.map(function (deltaGraph){
			var codeChangeId = deltaGraph.nodes()[0];
			var codeChange = deltaGraph.getCodeChange();
			var date = new Date(Number(codeChange.time));
			var dateStr = date.toDateAndTimeStr();
			return dateStr + ' - <a href="#">' + codeChangeId + '</a>' + ' (' + codeChange.contributor + ')';
		}).join('<br>');
		this.$messageElement.html(header + deltaHtml);
	}
	else{
		this.$messageElement.html('');
	}
};
