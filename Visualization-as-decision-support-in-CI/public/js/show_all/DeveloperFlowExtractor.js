function DeveloperFlowExtractor(aggregator){
	this.aggregator = aggregator;
}

DeveloperFlowExtractor.prototype.getFlow = function(graphs, developerName, method) {
	if(developerName === 'All'){
		return graphs;
	}
	else{
		var _method = method.replace(/ /g, '_');
		return this[_method](graphs, developerName);
	}
};

/*
 * Extracting methods
 */
DeveloperFlowExtractor.prototype.code_changes = function(graphs, developerName) {
	return graphs.filter(function(graph){
		return graph.getDeveloper() === developerName;
	});
};

DeveloperFlowExtractor.prototype.first_occurrence = function(graphs, developerName) {
	// Deep copy of graph
	//var graphs2 = $.extend(true, {}, graphs);

	var firstNodeUnions = [];
	var graphSequenceSlices = [];

	// For each code change of developer, get a slice of the CI
	// that reached until next time developer has made a code change
	var lastDevCommitIndex = undefined;
	for (var i = 0; i < graphs.length; i++) {
		if(graphs[i].getDeveloper() === developerName){
			if(lastDevCommitIndex === undefined){
				lastDevCommitIndex = i;
			}
			else{
				var subGraph = graphs.slice(lastDevCommitIndex, i);
				graphSequenceSlices.push(subGraph);
				lastDevCommitIndex = i;
			}	
		}
	}
	if(lastDevCommitIndex !== undefined){
		var lastSubGraph = graphs.slice(lastDevCommitIndex);
		graphSequenceSlices.push(lastSubGraph);
	}

	// For each of the slices, calculate a union by first node occurance
	for (var i = 0; i < graphSequenceSlices.length; i++) {
		var graphSequenceSlice = graphSequenceSlices[i];
		var firstNodeUnion = this.aggregator.unionOf(graphSequenceSlice, 'first_occurance');
		firstNodeUnions.push(firstNodeUnion);
	};
	

	return firstNodeUnions;
};


/*
 * Helper methods
 */