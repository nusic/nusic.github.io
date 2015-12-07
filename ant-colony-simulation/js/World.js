//
// World
//

function World (width, height, foodMap) {
	this.width = width;
	this.height = height;

	this.initGridData(foodMap);

	this.numUpdates = 0;

	this.ants = [];
	this.enemies = [];
	this.antColonies = [];
	this.foodSpawners = [];

	var smallBurstSpawner = {
		width: 10,
		height: 10,
		spawnTime: 1000,
		foodAmount: 10,
		burst: 10,
	};
	//this.foodSpawners.push(new FoodSpawner(this, 40, 40, smallBurstSpawner));
	//this.foodSpawners.push(new FoodSpawner(this, 6, 6, smallBurstSpawner));
	//this.foodSpawners.push(new FoodSpawner(this, width-6, 6, smallBurstSpawner));
	//this.foodSpawners.push(new FoodSpawner(this, width-30, 50, smallBurstSpawner));
/*
	var fastOmniSpawner = {
		width: width-6,
		height: height-6,
		spawnTime: 1,
		foodAmount: 1,
		burst: 1,
	};
	this.foodSpawners.push(new FoodSpawner(this, width/2, height/2, fastOmniSpawner));	
*/

	//this.antColonies.push(new AntColony(this, 1*width/4, height/2, 20));
	//this.antColonies.push(new AntColony(this, 3*width/4, height/2, 20));

	this.antColonies.push(new AntColony(this, width/2, height/2, 150));
	//this.antColonies.push(new AntColony(this, 3*width/4, height/2, 200));


	//enemyParams = {
	//	radius: 10,
	//	antKillChance: 0.9,
	//	attackCoolDown: 5,
	//	walkCoolDown: 50,
	//	hp: 1000,
	//};
	//var enemy = new Enemy(this, 2, 2, enemyParams);
	//this.enemies.push(enemy)

	//Start with a single ant to make things a little more exciting in the beginning
	var coloy = this.antColonies[0];
	var antPos = coloy.entrances[0];
	var ant = new Ant(this, this.antColonies[0], antPos.x, antPos.y, 0);
	ant.insideNest = true;
	this.ants.push(ant);
};

World.prototype.initGridData = function(foodMap) {
	//Convencience vars
	var cx = this.width/2;
	var cy = this.height/2;
	var w = this.width;
	var h = this.height;

	var canvas = document.createElement('canvas');
	canvas.width = foodMap.width;
	canvas.height = foodMap.height;
	var mapCtx = canvas.getContext('2d');

	mapCtx.drawImage(foodMap, 0, 0, foodMap.width, foodMap.height);

	console.log(foodMap);

	// Create ref to this in current scope for passing to closures
	var thisWorld = this;



	this.food = Utils.createGrid(w, h, function (i,j){
		if(foodMap){
			var data = mapCtx.getImageData(i,j,1,1).data;
			return data[1] > 0 ? 10 : 0;
		}
		if(Utils.insideRect(i, j, cx, cy + 20, 5, 5)){
			return 10;
		}/*
		if(Utils.insideRect(i, j, 5, 5, 5, 5)){
			return 10;
		}
		if(Utils.insideRect(i, j, 35, 35, 5, 5)){
			return 10;
		}
		if(Utils.insideRect(i, j, w-10, 10, 5, 5)){
			return 0;
		}*/
		if(Math.random() > 0.999){
			return 1;
		}
		return 0;
	});

	this.obstacles = Utils.createGrid(w, h, false);
};

World.prototype.entranceToAnthillAt = function(x, y) {
	for(var i = 0; i<this.antColonies.length; ++i){
		if(this.antColonies[i].hasEntranceAt(x, y)){
			return this.antColonies[i];
		}
	}
	return null;
};

World.prototype.forEachValInGrid = function(grid, callback) {
	for (var i = 0; i < this.width; i++) {
		for (var j = 0; j < this.height; j++) {
			callback(grid[i][j]);
		}
	}
};

World.prototype.sumGridValues = function(grid) {
	var sum = 0
	this.forEachValInGrid(grid, function (val) {
		sum += val;
	});
	return sum;
};

World.prototype.removeAnt = function(ant) {
	for (var i = 0; i < this.ants.length; i++) {
		if(this.ants[i] === ant){
			return this.ants.splice(i, 1);
		}
	};
};

World.prototype.antsInColony = function(colony) {
	var sum = 0;
	for (var i = 0; i < this.ants.length; i++) {
		if(this.ants[i].antColony === colony){
			sum++;
		}
	};
	return sum;
};

