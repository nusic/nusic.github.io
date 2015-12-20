/*
 * This code generates mockup CI work flow data. 
 *
 * Author: Erik Broberg, 2015
 *
 */

var fs = require('fs');
var graphlib = require('graphlib');
var dot = require('graphlib-dot');
var Graph = require('./CIGraph').Graph;
var uniqueid = require('uniqueid');

function CITemplatedGraphFactory(templateFileName, nodeFactory) {
	this.nodeFactory = nodeFactory;
	this.templateGraph = dot.read(fs.readFileSync(templateFileName, 'UTF-8'));
}

CITemplatedGraphFactory.prototype.create = function(numGraphs) {
	var graphs = [];
	for (var i = 0; i < numGraphs; i++) {
		graphs.push(this.createOne());
	};
	return graphs;
};

CITemplatedGraphFactory.prototype.createOne = function() {
	var pass = 'passed', fail = 'failed';

	var templateToConcreteNodeMap = {};

	var g = new Graph();

	var templateNodes = this.templateGraph.nodes();
	for (var i = 0; i < templateNodes.length; i++) {
		var templateNode = templateNodes[i];
		var templateNodeData = this.templateGraph.node(templateNode);
		var probability = +templateNodeData.probability || 1;

		if(Math.random() < probability){
			var node = this.nodeFactory.create(templateNode);
			g.setNode(node.id, node.data);
			templateToConcreteNodeMap[templateNode] = node.id;

			var pass_probability = templateNodeData.pass_probability
			if(pass_probability !== undefined){
				node.data.status = Math.random() < pass_probability ? pass : fail;

				if(node.data.status === fail){
					// Stop if a test failed 
					break;
				}
			}
		}

		var stopProbability = templateNodeData.stop_probability;
		stopProbability = stopProbability !== undefined ? +stopProbability : 0;
		if(Math.random() < stopProbability){
			break;
		}
	};

	var templateEdges = this.templateGraph.edges()
	for (var i = 0; i < templateEdges.length; i++) {
		var templateEdge = templateEdges[i];
		var templateEdgeData = this.templateGraph.edge(templateEdge);
		var srcNode = templateToConcreteNodeMap[templateEdge.v];
		var dstNode = templateToConcreteNodeMap[templateEdge.w];

		if(srcNode !== undefined && dstNode !== undefined){
			g.setEdge(srcNode, dstNode, templateEdgeData);
		}
	};

	return g;
};


exports.CITemplatedGraphFactory = CITemplatedGraphFactory;