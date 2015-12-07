
//
// AntQueenBrain
//

function AntQueenBrain (ant) {
	this.ant = ant;
}

AntQueenBrain.prototype.getAction = function () {
	// Decision tree
	var bestAction;
	// Queen does not get home sick, always walk around inside nest.
	if(this.ant.insideNest){
		bestAction = "layEggs";
	} else {
		bestAction = "lookForHome"; // Always look for home
	}
	return bestAction;
}