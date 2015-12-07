var Utils = {

	createGrid: function (w, h, value) {
		var grid = new Array(w);
		for (var i = 0; i < w; i++) {
			grid[i] = new Array(h);
			for (var j = 0; j < h; j++) {
				grid[i][j] = typeof value === 'function' ? value(i, j) : value;
			}
		}
		return grid;
	},

	// x: x-position to test
	// y: y-position to test
	// cx: x-position of center of rectangle 
	// cy: y-position of center of rectangle
	// w: width of rectangle   
	// h: height of rectangle 
	insideRect: function (x, y, cx, cy, w, h) {
		return (Math.abs(x - cx) <= w / 2) && (Math.abs(y - cy) <= h / 2);
	},


	extend: function(base, sub) {
		// Avoid instantiating the base class just to setup inheritance
		// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
		// for a polyfill
		// Also, do a recursive merge of two prototypes, so we don't overwrite 
		// the existing prototype, but still maintain the inheritance chain
		// Thanks to @ccnokes
		var origProto = sub.prototype;
		sub.prototype = Object.create(base.prototype);
		for (var key in origProto)  {
			sub.prototype[key] = origProto[key];
		}
		// Remember the constructor property was set wrong, let's fix it
		sub.prototype.constructor = sub;
		// In ECMAScript5+ (all modern browsers), you can make the constructor property
		// non-enumerable if you define it like this instead
		Object.defineProperty(sub.prototype, 'constructor', { 
			enumerable: false, 
			value: sub 
		});
	}
};