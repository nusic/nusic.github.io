var _times = [];

function tic(){
	_times.push(Date.now());
}

function toc(what){
	console.log((what || 'time') + ': ' + (Date.now() - _times.pop()) + ' ms');
}

function MinMax(){
	this.min = Infinity;
	this.max = -Infinity;
}

MinMax.prototype.add = function(a) {
	this.min = Math.min(a, this.min);
	this.max = Math.max(a, this.max);
};



THREE.PlaneGeometry.prototype.vertexIndexForSegment = function(x, y) {
	this.hns = this.hns || { // Half number of segmnets
		x: Math.floor((this.segments.x+1) / 2),
		y: Math.floor((this.segments.y+1) / 2),
	};
	if (x < -this.hns.x || this.hns.x < x ||
		y < -this.hns.y || this.hns.y < y){
		throw new Error('out of bounds: ' + x + ', ' + y + '  hns: ' + this.hns.x + ', ' + this.hns.y);
	}
	
	return Math.round(x + this.hns.x) - Math.round(y - this.hns.y)*(this.segments.x+1);
};

THREE.PlaneGeometry.prototype.vertexIndexForPosition = function(x, y) {
	
	this.psr = this.psr || { // Position segment ratio
		x: this.segments.x / this.size.x,
		y: this.segments.y / this.size.y,
	}

	// scale to segment space
	x *= this.psr.x;
	y *= this.psr.y;

	return this.vertexIndexForSegment(x, y);
};

THREE.PlaneGeometry.prototype.vertexAtPosition = function(x, y) {
	return this.vertices[this.vertexIndexForPosition(x, y)];
};

// http://stackoverflow.com/questions/5059951/deleting-js-object-properties-a-few-levels-deep
function deepDelete(target, context) {
	// Assume global scope if none provided.
	context = context || window;

	var targets = target.split('.');

	if (targets.length > 1){
		deepDelete(targets.slice(1).join('.'), context[targets[0]]);
	}
	else{
		delete context[target];
	}
}