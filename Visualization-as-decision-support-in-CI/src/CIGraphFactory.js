var graphlib = require('graphlib');
var Graph = require('./CIGraph').Graph;
var CINodeFactory = require('./CINodeFactory').CINodeFactory;
var uniqueid = require('uniqueid');

function CIGraphFactory(nodeFactory) {
	this.nodeFactory = nodeFactory;
}

CIGraphFactory.prototype.createEmpty = function() {
	var g = new Graph();
	g.nodeFactory = this.nodeFactory;
	return g;
}

function filter(tests, testExecutionProbability, startIndex) {

	tests = tests.filter(function (test) {
		return Math.random() < testExecutionProbability;
	});

	var indices = [];
	for (var i = 0; i < tests.length; i++) {
		indices.push(startIndex+i);
	};

	return {
		tests: tests,
		indices: indices
	};
}


function containsStatus(g, testIndices, status){
	var nodes = g.nodes();
	for (var i = 0; i < testIndices.length; i++) {
		var nodeIndex = testIndices[i];
		var nodeName = nodes[nodeIndex];
		var nodeData = g.node(nodeName);
		if(nodeData.status === status){
			return true;
		}
	};
	return false;
}


/**
 *
 *	ARGUMENTS: 
 *			numGraphs 					number of graphs to create, i.e. number
 *										of code_changes
 *
 *			testExecutionProbability 	probability that a test will be executed
 *
 *			manyToOneProbability		probability that flow stos after
 *										code_change, build or confidence_level
 *
 *	RETURNS:
 *			graphs 						Array of CIGraphs
 */
CIGraphFactory.prototype.create = function(numGraphs, testExecutionProbability, manyToOneProbability) {
	var graphs = [];

	var firstTests = ['patch_verification', 'code_review'];
	var secondTests = ['test_A', 'test_B'];
	var thirdTests = ['test_C', 'test_D'];

	for (var i = 0; i < numGraphs; i++) {
		var g = this.createEmpty();
		graphs.push(g);

		// Create Code Change
		g.set('code_change');

		// May stop due to 1:M relation
		if(Math.random() < manyToOneProbability) continue;

		// Else -> Let Code Change cause some tests, if any
		var first = filter(firstTests, testExecutionProbability, g.nodes().length);
		if(first.tests.length === 0) continue;
		g.cause(first.tests);

		// If any test failed, stop flow here
		if(containsStatus(g, first.indices, 'failed')) continue;

		// Else -> Let tests cause a build. Remeber build reference
		g.set('build').causedBy(first.indices);
		var build = g.nodes().length-1;

		// May stop due to 1:M relation
		if(Math.random() < manyToOneProbability) continue;

		// Else -> Build cause an artifact, and some tests, if any
		var second = filter(secondTests, testExecutionProbability, g.nodes().length);
		g.cause(second.tests.concat('artifact'));

		// Store artifact reference
		var artifact = g.nodes().length-1;

		// Stop if we didn't execute any second tests, or if any second tests failed
		if(second.tests.length === 0) continue;
		if(containsStatus(g, second.indices, 'failed')) continue;

		// If test passed -> Set confidence caused by second tests, subject to artifact
		g.set('confidence_level').causedBy(second.indices).subjectTo(artifact);

		// May stop due to 1:M relation
		if(Math.random() < manyToOneProbability) continue;

		// Else -> Confidence level causes the third group of tests
		var third = filter(thirdTests, testExecutionProbability, g.nodes().length);
		g.cause(third.tests);

	};

	return graphs;
};



exports.CIGraphFactory = CIGraphFactory;