//
// AntQueen
//

function AntQueen (world, antColony, x, y, angle) {
	Ant.call(this, world, antColony, x, y, angle);

	this.brain = new AntQueenBrain(this);

	this.insideNest = true;

	this.homePheromone = 0;
	this.foodPheromone = 0;
}

AntQueen.prototype.act = function() {
	var actionName = this.brain.getAction();
	this[actionName].call(this);
	this.update();
};

AntQueen.prototype.update = function() {
	this.hunger += 1;
	this.age += 1;
	if(this.hunger > this.STATIC.MAX_HUNGER){
		return this.world.removeAnt(this);
	}
	if(this.antColony.food > 0 && this.hunger > this.STATIC.HUNGER_PER_FOOD){
		this.hunger -= this.STATIC.HUNGER_PER_FOOD;
		this.antColony.food--;
	}
	if (this.insideNest) {
		// Check if exit is found and inside, do not go out
		if (this.world.entranceToAnthillAt(this.x,this.y) === this.antColony) {
			this.exitPheromone = 1;
		}
	} 
	else {
		//Outside nest
		this.exitPheromone = 0;
		// Check if home is found and outside
		if (this.world.entranceToAnthillAt(this.x,this.y) === this.antColony) {
			this.insideNest = true;
			this.exitPheromone = 1;
		}
	}

	// Spread pheromones
	this.antColony.homePheromones[this.x][this.y] = Math.max(this.antColony.homePheromones[this.x][this.y], this.homePheromone);
	this.antColony.exitPheromones[this.x][this.y] = Math.max(this.antColony.exitPheromones[this.x][this.y], this.exitPheromone);
	this.antColony.foodPheromones[this.x][this.y] = Math.max(this.antColony.foodPheromones[this.x][this.y], this.foodPheromone);

	// Loose pheromones
	this.homePheromone -= this.STATIC.HOME_PHERMONE_DECREASE;
	this.exitPheromone -= this.STATIC.EXIT_PHERMONE_DECREASE;
	this.foodPheromone -= this.STATIC.FOOD_PHERMONE_DECREASE;
};

//
// Low level actions
//

AntQueen.prototype.layEgg = function() {
	/*
	//Should lay an egg, but simple creates a new ant atm.
	this.antColony.food -= this.STATIC.LAY_EGG_COST;
	var x = this.x;
	var y = this.y;
	var a = new Ant(this.world, this.antColony, x, y, this.angle);
	a.insideNest = true;
	this.world.ants.push(a);
	*/
	/*
	var x = this.x;
	var y = this.y;
	var e = new Egg(this.world, this.antColony, x, y, this.angle);
	e.insideNest = true;
	this.antColony.eggs.push(e);
	*/
	if (!this.antColony.eggs[this.x][this.y]){
		this.antColony.eggs[this.x][this.y] =
			this.STATIC.EGG_MIN_AGE +
			Math.random() * (this.STATIC.EGG_MAX_AGE - this.STATIC.EGG_MIN_AGE);
		this.antColony.food -= this.STATIC.LAY_EGG_COST;
	}
};

//
// High level actions
//

AntQueen.prototype.layEggs = function() {
	this.wander();
	if(Math.random() < 1.0){
		if(this.antColony.food > this.STATIC.LAY_EGG_COST &&
			this.antColony.exitPheromones[this.x][this.y]){
			// Only lay an egg where there are exit pheromones
			this.layEgg();
		}
	}
};

Utils.extend(Ant, AntQueen);