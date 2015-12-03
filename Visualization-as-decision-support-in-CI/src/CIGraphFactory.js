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

/**
 *	Create a CI Graph with structures varying from 
 *	the standard 1:1 mapping.
 *
 *	ARGUMENTS: 
 *			numGraphs 								number of graphs to create, i.e. number 
 *																of code_changes
 *			testExecutionProbability 	probability that a test will be executed.
 *
 *	RETURNS:
 *			g 												CIGraph, with multiple code_changes
 */
CIGraphFactory.prototype.create = function(numGraphs, testExecutionProbability) {
	var graphs = [];

	var firstTests = ['patch_verification', 'code_review'];
	var secondTests = ['test_A', 'test_B'];
	var thirdTests = ['test_C', 'test_D'];

	for (var i = 0; i < numGraphs; i++) {
		var g = this.createEmpty();
		g.set('code_change');

		// Cause some tests, which causes build. Remember build index
		var first = filter(firstTests, testExecutionProbability, g.nodes().length);
		if(first.tests.length === 0) continue;

		g.cause(first.tests).set('build').causedBy(first.indices);
		var build = g.nodes().length-1;

		// build may cause some more tests, and an artifact
		var second = filter(secondTests, testExecutionProbability, g.nodes().length);
		if(second.tests.length === 0) continue;

		g.cause(second.tests.concat('artifact'));
		var artifact = g.nodes().length-1;

		// second tests cause confidence level subject to artifact, which in turn may cause more test
		var third = filter(thirdTests, testExecutionProbability, g.nodes().length);
		g.set('confidence_level').causedBy(second.indices).subjectTo(artifact).cause(third.tests);

		graphs.push(g);
	};

	return graphs;
};


exports.CIGraphFactory = CIGraphFactory;