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


// Create graph
var ciGraphFactory = new CIGraphFactory();
var g = ciGraphFactory.create(10, 0.7);


// Output graph
var writer = (process.argv.indexOf('--json') !== -1) ? graphlib.json : dot;
var specifiedFile = process.argv.indexOf('-file')+1;


var graphStr = writer.write(g);

if(specifiedFile){
	var fileName = process.argv[specifiedFile];
	
	fs.writeFile(fileName, graphStr, function (err) { 
		if(err) return console.error(err);
		console.log('saved to ' + fileName);
	});
}
else if (process.argv.indexOf('--none') === -1){
	console.log(graphStr);
}