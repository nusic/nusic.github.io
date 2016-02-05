/*
 * This code generates mockup CI work flow data. 
 *
 * Author: Erik Broberg, 2015
 *
 */

var fs = require('fs');
var graphlib = require("graphlib");
var dot = require('graphlib-dot');

var CITemplatedGraphFactory = require('./src/CITemplatedGraphFactory.js').CITemplatedGraphFactory;
var CIGraphFactory = require('./src/CIGraphFactory.js').CIGraphFactory;
var CINodeFactory = require('./src/CINodeFactory.js').CINodeFactory;


// Get command line args
var numGraphsIndex = process.argv.indexOf('-n')+1;
var numGraphs = numGraphsIndex ? parseInt(process.argv[numGraphsIndex]) : 1;

var testExecutionProbabilityIndex = process.argv.indexOf('-p')+1;
var testExecutionProbability = testExecutionProbabilityIndex ? parseFloat(process.argv[testExecutionProbabilityIndex]) : 1;

var manyToOneProbabilityIndex = process.argv.indexOf('-m')+1;
var manyToOneProbability = manyToOneProbabilityIndex ? parseFloat(process.argv[manyToOneProbabilityIndex]) : 1;

var templateFileNameIndex = process.argv.indexOf('-template')+1;
var templateFileName = templateFileNameIndex ? process.argv[templateFileNameIndex] : null;

console.log('templateFileName: ' + templateFileName);

// Init Graph factory
var ciGraphFactory;
if(templateFileName){
	ciGraphFactory = new CITemplatedGraphFactory(templateFileName, new CINodeFactory());	
}
else{
	ciGraphFactory = new CIGraphFactory(new CINodeFactory());
}

// Create graph
var graphs = ciGraphFactory.create(numGraphs, testExecutionProbability, manyToOneProbability);


// if not '--none' was specified, output the graph
if(process.argv.indexOf('--none') === -1){

	var toJsonStr = function(graphs){
		var jsonGraphs = [];
		graphs.forEach(function (g){
			jsonGraphs.push(graphlib.json.write(g));
		});
		return JSON.stringify(jsonGraphs, null, 2);
	}

	var toDotStr = function(graphs){
		var graphStr = '';
		graphs.forEach(function (g){
			graphStr += dot.write(g) + '\n';
		});
		return graphStr;
	}

	var stringify = (process.argv.indexOf('--json') !== -1) ? toJsonStr : toDotStr;
	var graphStr = stringify(graphs);

	var fileNameIndex = process.argv.indexOf('-file')+1;
	if(fileNameIndex){
		var fileName = process.argv[fileNameIndex];
		
		fs.writeFile(fileName, graphStr, function (err) { 
			if(err) return console.error(err);
			console.log('saved to ' + fileName);
		});
	}
	else{
		console.log(graphStr);
	}
}


