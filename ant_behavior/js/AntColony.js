//
// AntColony
//

function AntColony (world, x, y, food) {
	console.log("Creating ant colony at x:", x, " y:", y);
	this.world = world;
	this.entrances = [{
		x: x,
		y: y,
	}];
	

	var w = world.width;
	var h = world.height;
	this.capacity = this.STATIC.START_CAPACITY;

	var queen = new AntQueen(world, this, x, y, 0);
	world.ants.push(queen);
	//this.eggs = [];

	this.food = food;
	this.buildMaterial = 0;

	// Grids
	this.eggs = Utils.createGrid(w, h, 0);

	// Pheromones
	this.homePheromones = Utils.createGrid(w, h, 0);
	this.exitPheromones = Utils.createGrid(w, h, 0);
	this.foodPheromones = Utils.createGrid(w, h, 0);

	this.nest = Utils.createGrid(w, h, function (i,j) {
		return Utils.insideRect(i, j, x, y, 1, 3) ? 1 : 0;
	});
	this.antHill = Utils.createGrid(w, h, function (i,j) {
		return Utils.insideRect(i, j, x, y, 1, 3) ? 1 : 0;
	});
};

AntColony.prototype.STATIC = {
	START_CAPACITY: 20,
}

AntColony.prototype.hasEntranceAt = function(x, y) {
	for (var i = 0; i < this.entrances.length; i++) {
		var entrance = this.entrances[i];
		if(x === entrance.x && y === entrance.y){
			return true;
		}
	};
	return false;
};

AntColony.prototype.newEntrance = function(x, y) {
	if(!this.hasEntranceAt(x,y)) {
		this.entrances.push({x:x, y:y});
	}
	return false;
};

/*
AntColony.prototype.removeEgg = function(egg) {
	for (var i = 0; i < this.eggs.length; i++) {
		if(this.eggs[i] === egg){
			return this.eggs.splice(i, 1);
		}
	};
};
*/