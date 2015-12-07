
//
// Brain
//

function Brain (ant) {
	this.ant = ant;
}

Brain.prototype.getAction = function () {
	// Decision tree
	var bestAction;
	if(this.ant.insideNest){
		var lostInsideNest = this.ant.lostInsideNest();
		if (this.ant.carryingDirt || lostInsideNest) {
			bestAction = "lookForExit";
		} else if (!this.ant.carryingDirt) {
			bestAction = "digNest";
		}
	} else 	if(!this.ant.insideNest){
		var lostOutsideNest = this.ant.lostOutsideNest();
		var needFood = this.ant.hunger > 0.8 * this.ant.STATIC.MAX_HUNGER;
		if (this.ant.carryingFood || lostOutsideNest || (needFood && this.ant.antColony.food > 0)) {
			bestAction = "lookForHome";
		} else if(this.ant.carryingDirt) {
			bestAction = "buildAntHill";
		}
		else if (!this.ant.carryingFood) {
			bestAction = "lookForFood";
		}
	}
	return bestAction;
}
