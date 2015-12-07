	
function FoodSpawner(world, x, y, spec){
	this.world = world;
	this.x = x;
	this.y = y;
	this.width = spec.width || 1;
	this.height = spec.height || 1;
	this.spawnTime = spec.spawnTime;
	this.foodAmount = spec.foodAmount;
	this.burst = spec.burst || 1;

	this.lastSpawned = 0;

	console.log(this);
}

FoodSpawner.prototype.update = function() {
	if(this.lastSpawned++ === this.spawnTime){
		for (var i = 0; i < this.burst; i++) {
			this.spawn();
		};		
		this.lastSpawned = 0;
	}
};

FoodSpawner.prototype.spawn = function () {
	//Randomize position for food
	var x = this.x + Math.floor(this.width *(Math.random()-0.5));
	var y = this.y + Math.floor(this.height*(Math.random()-0.5));
	this.world.food[x][y] += this.foodAmount;
}