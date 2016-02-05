/*
 * This code defines convenience functions for
 * generating mockup CI work flow data. 
 *
 * Author: Erik Broberg, 2015
 *
 */

var Graph = require("graphlib").Graph;
var CINodeFactory = require('./CINodeFactory.js').CINodeFactory;


/**
 *	Gets the node at the given index, or the node last
 *	node defined in the graph if <index> is undefined.
 *
 *	ARGUMENTS:
 *		index			Specifying the index:th node created
 * 
 *	RETURNS: 
 *		A String containing the ID of the Node at the given index
 */
Graph.prototype.lastNodeOrAt = function(index) {
	index = index !== undefined ? index : this.nodes().length - 1;
	return this.nodes()[index];
};



/**
 *	Creates new nodes of types in <nodeTypes> and new edges 
 *	of type <edgeType>. The new nodes are appended the node
 *	at the given <index>, or to the last node if <index>
 *	is undefined.
 *
 *	ARGUMENTS:
 *		edgeType:		A String representing the type of to edge to
 *								be created.
 *		nodeTypes:	An Array of Strings (or a single String) 
 *								representing the type(s) of node(s) to be created
 *		index				Specifying the node to append the new nodes to.
 * 
 *	RETURNS: 
 *		this (to allow for chaining)
 */
Graph.prototype.append = function(edgeType, nodeTypes, index) {
	if(!(nodeTypes instanceof Array)) {
		nodeTypes = [nodeTypes];
	}

	index = index !== undefined ? index : this.nodes().length - 1;
	var nodeToPointTo = this.lastNodeOrAt(index);

	for (var i = 0; i < nodeTypes.length; i++) {
		var node = this.nodeFactory.create(nodeTypes[i]);
		this.setNode(node.id, node.data);
		this.setEdge(node.id, nodeToPointTo, {type: edgeType});
	};

	return this;
};

/**
 * Helper function for appending a node with a cause-edge.
 */
Graph.prototype.cause = function(nodeTypes, index) {
	return this.append('cause', nodeTypes, index);
};



/**
 * Helper function for appending a node with a subject-edge.
 */
Graph.prototype.subject = function(nodeTypes, index) {
	return this.append('subject', nodeTypes, index);
};



/**
 *	Creates edges of type <edgeType>. The edges point from the 
 *	last node to previously defined nodes at the given indices.
 *
 *	ARGUMENTS 
 *		edgeType:			A String representing the type of to edge
 *									to be created.
 *		indices:			An array of indices, or a single index 
 *									specifying the node to create edge to
 * 
 *	RETURNS: 
 *		this (to allow for chaining)
 */
Graph.prototype.createEdgeTo = function(edgeType, indices) {
	if(!(indices instanceof Array)){
		indices = [indices];
	}

	var fromNode = this.lastNodeOrAt();
	for (var i = 0; i < indices.length; i++) {
		var toNode = this.lastNodeOrAt(indices[i]);
		this.setEdge(fromNode, toNode, {type: edgeType});
	};

	return this;
};


/**
 * Helper function for creating cause-edges to the nodes
 * at the given indices.
 */
Graph.prototype.causedBy = function(indices) {
	return this.createEdgeTo('cause', indices);
};



/**
 * Helper function for creating subject-edges to the nodes
 * at the given indices.
 */
Graph.prototype.subjectTo = function(indices) {
	return this.createEdgeTo('subject', indices);
};


/**
 *	Creates a new Node and adds it to the graph.
 *
 *	ARGUMENTS 
 *		nodeType:			A String representing the type of Node
 *									to be created.
 * 
 *	RETURNS: 
 *		this (to allow for chaining)
 */
Graph.prototype.set = function(nodeType) {
	var node = this.nodeFactory.create(nodeType);
	this.setNode(node.id, node.data);
	return this;
};


exports.Graph = Graph;