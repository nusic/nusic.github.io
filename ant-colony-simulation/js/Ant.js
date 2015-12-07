//
// Ant
//

function Ant (world, antColony, x, y, angle) {
	this.world = world;
	this.antColony = antColony;

	//Brain
	this.brain = new Brain(this);

	this.hunger = 0;
	this.age = 0;
	
    // Position and orientation
    this.x = x;
    this.y = y;
    this.angle = angle; // 0-7

 	// Pheromones
    this.foodPheromone = 0;
    this.homePheromone = 0;
    this.exitPheromone = 0;

    // Determines behavior
    this.carryingFood = false;
    this.carryingDirt = false;
    this.insideNest = false;
};

Ant.prototype.AVAILABLE_ACTIONS = ["lookForFood", "lookForHome", "lookForExit", "digNest", "buildAntHill"];

// STATIC CONSTANTS
Ant.prototype.STATIC = {
	FOOD_PHERMONE_DECREASE: 0.005,
	HOME_PHERMONE_DECREASE: 0.005,
	EXIT_PHERMONE_DECREASE: 0.04,

	MAX_INSIDE_HOMESICKNESS: 50,
	MAX_OUTSIDE_HOMESICKNESS: 200,

	MAX_AGE: 1500,
	MAX_HUNGER: 2000000,

	HUNGER_PER_FOOD: 1000,
	LAY_EGG_COST: 10,
	EGG_MIN_AGE: 500,
	EGG_MAX_AGE: 5000
};

Ant.prototype.act = function() {
	var actionName = this.brain.getAction();
	this[actionName].call(this);
	this.update();
};

Ant.prototype.update = function() {

	// Update hunger and age
	this.hunger++;
	this.age++;

	if(this.age > this.STATIC.MAX_AGE || this.hunger > this.STATIC.MAX_HUNGER){
		if(Math.random() > 0.999){
			this.kill();
			return;
		}
	}

	if (this.insideNest) {
		// Check if exit is found and inside
		if (this.world.entranceToAnthillAt(this.x,this.y) === this.antColony &&
			(this.lostInsideNest() || this.carryingDirt) ) {
			this.insideNest = false;
			this.homePheromone = 1;
			this.exitPheromone = 0;
			this.foodPheromone = 0;
			this.angle = Math.floor(Math.random() * 7);
		}
	} 
	else {
		//Outside nest

		this.exitPheromone = 0;
		// Check if home is found and outside
		if (this.world.entranceToAnthillAt(this.x,this.y) === this.antColony) {
			this.insideNest = true;
			if(this.carryingFood){
				this.antColony.food++;
				this.carryingFood = false;
			}
			this.exitPheromone = 1;
			this.foodPheromone = 0;
			this.homePheromone = 0;
			this.angle = Math.floor(Math.random() * 7);

			//this.homeSickTimer = 0;
			if(this.antColony.food > 0 && this.hunger > this.STATIC.HUNGER_PER_FOOD){
				this.hunger -= this.STATIC.HUNGER_PER_FOOD;
				this.antColony.food--;
			}
		}
		// Check if food is found
		if (!this.carryingDirt && this.world.food[this.x][this.y] > 0){
			this.world.food[this.x][this.y]--;
			this.carryingFood = true;
			this.foodPheromone = Math.min(this.world.food[this.x][this.y], 1);
			//this.homePheromone = 0;
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
// BASIC ACTIONS
//

Ant.prototype.walk = function() {
	MoveLogic.walk(this);
};

Ant.prototype.idle = function(){
	return;
}

Ant.prototype.kill = function() {
	this.antColony.food += this.STATIC.LAY_EGG_COST * 0.8;
	this.world.removeAnt(this);
};

Ant.prototype.turnLeft = function() {
	MoveLogic.turnLeft(this);
};

Ant.prototype.turnRight = function() {
	MoveLogic.turnRight(this);
};

Ant.prototype.dig = function() {
	var centerSensorPosition = MoveLogic.getRelativeCenterSensorPosition(this);

	var digPosX = this.x + centerSensorPosition.x;
	var digPosY = this.y + centerSensorPosition.y;

	var numReachableSensor = 0;
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			if (this.antColony.nest[digPosX + i][digPosY + j])
				numReachableSensor++;
		};
	};
	var numReachable = this.getNumReachable(this.antColony.nest);

	if (!this.antColony.nest[digPosX][digPosY] &&
		(numReachableSensor == 3 || numReachableSensor == 2) &&
		(numReachable > 2 && numReachable < 5)) {
		this.antColony.nest[digPosX][digPosY] = 1;
		this.carryingDirt = true;
		return;
	};
	// If failed to dig nest, check if it can dig a new entrance
	if (this.antColony.antHill[this.x][this.y] && this.antColony.exitPheromones[this.x][this.y] < 0.6){
		// Check so that there is no entrance close
		var entranceClose = false;
		for (var i=-1; i<2; i++){
			for (var j=-1; j<2; j++){
				if (this.antColony.hasEntranceAt(this.x + i, this.y + j)) {
					entranceClose = true;
					break;
				};
			}			
		}
		if (!entranceClose) {
			this.antColony.newEntrance(this.x, this.y);
			this.carryingDirt = true;
		};
	}
}

Ant.prototype.placeDirt = function() {
	// The ant can only place dirt at the rim of the anthill
	var antHill = this.antColony.antHill;
	var numReachableAnthill = this.getNumReachable(antHill);

	if (numReachableAnthill >= 1 && antHill[this.x][this.y] === 0) {
		this.antColony.antHill[this.x][this.y] += 1;
		this.carryingDirt = false;
	};
}

Ant.prototype.averagePheromoneLocally = function(pheromoneMap) {
	var pheromone = 0;
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			pheromone += pheromoneMap[this.x + i][this.y + j];
		};
	};
	pheromone /= 9;
	pheromoneMap[this.x][this.y] = pheromone;
}

Ant.prototype.getNumReachable = function(map) {
	var numReachable = 0;
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			if (map[this.x + i][this.y + j])
				numReachable++;
		};
	};
	return numReachable;
}

Ant.prototype.getDirectionToHighestPheromone = function(pheromoneMap) {
	var pheromoneDirection = -1;
	var maxPheromoneValue = 0;

	if (pheromoneMap[this.x + 1][this.y] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x + 1][this.y];
		pheromoneDirection = 0;
	};
	if (pheromoneMap[this.x + 1][this.y + 1] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x + 1][this.y + 1];
		pheromoneDirection = 1;
	};
	if (pheromoneMap[this.x][this.y + 1] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x][this.y + 1];
		pheromoneDirection = 2;
	};
	if (pheromoneMap[this.x - 1][this.y + 1] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x - 1][this.y + 1];
		pheromoneDirection = 3;
	};
	if (pheromoneMap[this.x - 1][this.y] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x - 1][this.y];
		pheromoneDirection = 4;
	};
	if (pheromoneMap[this.x - 1][this.y - 1] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x - 1][this.y - 1];
		pheromoneDirection = 5;
	};
	if (pheromoneMap[this.x][this.y - 1] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x][this.y - 1];
		pheromoneDirection = 6;
	};
	if (pheromoneMap[this.x + 1][this.y - 1] > maxPheromoneValue) {
		maxPheromoneValue = pheromoneMap[this.x + 1][this.y - 1];
		pheromoneDirection = 7;
	};
	return pheromoneDirection;
}

Ant.prototype.getRelativeSensorPosition = function() {
	return MoveLogic.getRelativeSensorPosition(this);
}

Ant.prototype.lostInsideNest = function(){
	return this.insideNest && (this.antColony.exitPheromones[this.x][this.y] === 0 || this.exitPheromone <= 0);
}

Ant.prototype.lostOutsideNest = function(){
	return !this.insideNest && (!this.antColony.homePheromones[this.x][this.y] === 0 || this.homePheromone <= 0);
}

//
// HIGH LEVEL ACTIONS
//

Ant.prototype.wander = function() {
	MoveLogic.wander(this);
}

Ant.prototype.lookForHome = function() {
	// Find the way
	var pheromoneDirectionToHome = this.getDirectionToHighestPheromone(this.antColony.homePheromones)

	var random = Math.random();
	if (pheromoneDirectionToHome != -1 && random < 0.6) {
		this.angle = pheromoneDirectionToHome;
		this.walk();
	}
	else{
		this.wander();
	}
}

Ant.prototype.canWalk = function() {
	// Relative Sensor Position
	var rsp = this.getRelativeSensorPosition().center;
	return (!this.insideNest && !this.world.obstacles[this.x + rsp.x][this.y + rsp.y]) || (this.insideNest && this.antColony.nest[this.x + rsp.x][this.y + rsp.y]);
};

Ant.prototype.lookForExit = function() {
	// Find the way
	var pheromoneDirectionToExit = this.getDirectionToHighestPheromone(this.antColony.exitPheromones)

	var random = Math.random();
	if (pheromoneDirectionToExit != -1 && random < 0.6) {
		this.angle = pheromoneDirectionToExit;
		this.walk();
	}
	else{
		this.wander();
	}
}

Ant.prototype.lookForFood = function() {
	// Find the way
	var pheromoneDirectionToFood = this.getDirectionToHighestPheromone(this.antColony.foodPheromones)

	var random = Math.random();
	if (pheromoneDirectionToFood != -1 && random < 0.6) {
		this.angle = pheromoneDirectionToFood;
		this.walk();
	}
	else{
		this.wander();
	}
}

Ant.prototype.digNest = function() {
	if (!this.insideNest){
		this.lookForHome();
	}
	else {
		this.wander();
		this.dig();
	}
}

Ant.prototype.buildAntHill = function() {
	if (!this.carryingDirt){
		this.digNest();
	}
	else {
		if (this.insideNest){
			this.lookForExit();
		}
		else {
			this.wander();
			this.placeDirt();
		}
	}
}

