function Enemy(world, x, y, stats){
	this.world = world;
	this.x = x;
	this.y = y;
	this.angle = 0;
	this.radius = stats.radius;
	this.antKillChance = stats.antKillChance;
	this.attackCoolDown = stats.attackCoolDown;
	this.walkCoolDown = stats.walkCoolDown;
	this.hp = stats.hp;
	this.food = stats.hp;

	this.lastWalk = 0;
	this.lastAttack = 0;
}

Enemy.prototype.act = function() {
	//this.wander();
	this.attack();
};

Enemy.prototype.wander = function() {
	if(this.lastWalk++ == this.walkCoolDown){
		MoveLogic.wander(this);
		this.lastWalk = 0;
	}
};

Enemy.prototype.attack = function() {
	if(this.lastAttack++ == this.attackCoolDown){
		for (var i = 0; i < this.world.ants.length; i++) {
			var ant = this.world.ants[i];
			if(Math.random() < this.antKillChance && this.reachable(ant)){
				console.log("kill ant");
				ant.kill();
			}
		};
		this.lastAttack = 0;
	}
};

Enemy.prototype.reachable = function(obj) {
	if(obj.insideNest){
		return false;
	}
	var dx = this.x - obj.x;
	var dy = this.y - obj.y;
	return this.radius*this.radius > dx*dx + dy*dy;
};

Enemy.prototype.canWalk = function() {
	return true;
};
