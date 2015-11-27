/*
 * This code generates mockup CI work flow data. 
 *
 * Author: Erik Broberg, 2015
 *
 */

var fs = require('fs');
var graphlib = require("graphlib");
var dot = require('graphlib-dot');

var CIGraphFactory = require('./src/CIGraphFactory.js').CIGraphFactory;
var CINodeFactory = require('./src/CINodeFactory.js').CINodeFactory;


// Create graph
var ciGraphFactory = new CIGraphFactory(new CINodeFactory());
var graphs = ciGraphFactory.create(10, 0.7);


// if not '--none' was specified, output the graph
if(process.argv.indexOf('--none') === -1){

	var toJsonStr = function(g){
		return JSON.stringify(graphlib.json.write(g), null, 2);
	}

	var toDotStr = function(g){
		return dot.write(g);
	}

	var stringify = (process.argv.indexOf('--json') !== -1) ? toJsonStr : toDotStr;
	var specifiedFile = process.argv.indexOf('-file')+1;

	var graphStr = '';
	graphs.forEach(function (g){
		graphStr += stringify(g) + '\n';
	});

	if(specifiedFile){
		var fileName = process.argv[specifiedFile];
		
		fs.writeFile(fileName, graphStr, function (err) { 
			if(err) return console.error(err);
			console.log('saved to ' + fileName);
		});
	}
	else{
		console.log(graphStr);
	}
}