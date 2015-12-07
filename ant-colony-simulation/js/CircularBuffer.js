//
// Circular Buffer. 
//
// Externally-apparent 'length' increases indefinitely
// while any items with indexes below length-n will be forgotten (undefined
// will be returned if you try to get them, trying to set is an exception).
// n represents the initial length of the array, not a maximum
function CircularBuffer(n, val) {
    this._array= new Array(n);
    this.length= 0;
    for (var i = 0; i < this._array.length; i++) {
        this._array[i] = val;
    };
}

CircularBuffer.prototype.toString= function() {
    return '[object CircularBuffer('+this._array.length+') length '+this.length+']';
};

CircularBuffer.prototype.get= function(i) {
    //console.log('GET');
    //console.log('i:', i);
    //console.log('this.length:', this.length);
    //console.log('this._array.length:', this._array.length);
    if (i < 0 || i < this.length-this._array.length){
        return undefined;
    }
    return this._array[i%this._array.length];
};

CircularBuffer.prototype.set= function(i, v) {
    if (i < 0 || i < this.length-this._array.length){
        throw 'CircularBuffer IndexError: ' + i;
    }
    
    while (i>this.length) {
        this._array[this.length%this._array.length] = undefined;
        this.length++;
    }

    this._array[i%this._array.length] = v;
    if (i === this.length){
        this.length++;
    }
};

CircularBuffer.prototype.asArray = function() {
    var start = this.length%this._array.length;
    var a1 = this._array.slice(start, this.length);
    var a2 = this._array.slice(0, start);
    return a1.concat(a2);
};